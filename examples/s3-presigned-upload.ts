/**
 * Example: S3 presigned upload flow with Coral metadata API (TypeScript).
 *
 * What it does:
 * - Generates short-lived S3 PUT presigned URLs using AWS SDK v3.
 * - Persists upload metadata (status, mimeType, size, key) with Coral routes.
 * - Protects asset CRUD with JWT middleware and owner authorization checks.
 */

import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Coral from 'coral';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
  };
}

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
const AWS_REGION = process.env.AWS_REGION ?? 'us-east-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET ?? '';

const s3 = new S3Client({ region: AWS_REGION });

// Persist S3 upload metadata with validation and lifecycle status.
const mediaAssetSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[A-Za-z0-9._-]{10,200}$/,
    },
    bucket: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 63,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
      enum: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    },
    sizeBytes: {
      type: Number,
      required: true,
      min: 1,
      max: 10 * 1024 * 1024,
    },
    status: {
      type: String,
      enum: ['pending_upload', 'uploaded', 'processing', 'ready', 'failed'],
      default: 'pending_upload',
    },
    publicUrl: {
      type: String,
      default: '',
      maxlength: 2048,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ ownerId: 1, createdAt: -1 });

const MediaAsset = mongoose.model('MediaAsset', mediaAssetSchema);

const requireBearerToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header must be Bearer token' });
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    const userId = typeof payload.sub === 'string' ? payload.sub : undefined;
    if (!userId) {
      return res.status(401).json({ message: 'Token is missing subject' });
    }

    req.auth = { userId };
    next();
  } catch {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

const attachOwnerOnCreate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    req.body = {};
  }

  // Force owner linkage from JWT.
  if (req.method === 'POST' && req.auth?.userId) {
    req.body.ownerId = req.auth.userId;
  }
  if (req.method === 'POST' && !req.body.bucket) {
    req.body.bucket = AWS_S3_BUCKET;
  }

  next();
};

const blockImmutableFieldChangesOnUpdate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  if (
    req.method === 'PUT' &&
    req.body &&
    typeof req.body === 'object' &&
    !Array.isArray(req.body)
  ) {
    // Keep object identity and ownership immutable after create.
    delete req.body.key;
    delete req.body.bucket;
    delete req.body.ownerId;
    delete req.body.mimeType;
    delete req.body.sizeBytes;
  }

  next();
};

const ensureOwnerOnWrite = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return next();
  }

  const assetKey = req.params.idAttribute;
  if (!req.auth?.userId || !assetKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const asset = await MediaAsset.findOne({ key: assetKey }).select('ownerId').lean();
  if (!asset) {
    return res.status(404).json({ message: 'Asset not found' });
  }

  if (String(asset.ownerId) !== req.auth.userId) {
    return res.status(403).json({ message: 'Only asset owner can modify this resource' });
  }

  next();
};

app.post(
  '/api/media-assets/presign',
  requireBearerToken,
  async (req: AuthenticatedRequest, res: Response) => {
    if (!AWS_S3_BUCKET) {
      return res.status(500).json({ message: 'AWS_S3_BUCKET is not configured' });
    }

    const { fileName, mimeType, sizeBytes } = req.body as {
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
    };

    if (!fileName || !mimeType || typeof sizeBytes !== 'number' || !Number.isFinite(sizeBytes)) {
      return res.status(400).json({ message: 'fileName, mimeType and sizeBytes are required' });
    }

    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    if (!allowedMimeTypes.has(mimeType)) {
      return res.status(400).json({ message: `Unsupported mimeType: ${mimeType}` });
    }

    if (sizeBytes < 1 || sizeBytes > 10 * 1024 * 1024) {
      return res.status(400).json({ message: 'sizeBytes must be between 1B and 10MB' });
    }

    const safeFileName = fileName.replace(/[^A-Za-z0-9._-]/g, '-').slice(0, 80) || 'upload.bin';
    const key = `${Date.now()}-${randomUUID()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      ContentType: mimeType,
      // Include expected object length in the signed request.
      ContentLength: sizeBytes,
      Metadata: {
        uploadedBy: req.auth?.userId ?? 'unknown',
      },
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    res.json({
      key,
      uploadUrl,
      expiresInSeconds: 300,
      bucket: AWS_S3_BUCKET,
      region: AWS_REGION,
    });
  },
);

app.use(
  Coral({
    path: '/api/media-assets',
    model: MediaAsset,
    idAttribute: 'key',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    middlewares: [
      requireBearerToken,
      attachOwnerOnCreate,
      blockImmutableFieldChangesOnUpdate,
      ensureOwnerOnWrite,
    ],
    bodyFilter: [
      'key',
      'bucket',
      'ownerId',
      'mimeType',
      'sizeBytes',
      'status',
      'publicUrl',
      'metadata',
    ],
    query: {
      options: {
        sort: '-createdAt',
      },
    },
    fields: 'key bucket ownerId mimeType sizeBytes status publicUrl createdAt updatedAt',
  }),
);

app.listen(3011, () => {
  console.log('s3-presigned-upload running on http://localhost:3011');
});
