/**
 * Example: JWT-authenticated Coral routes (TypeScript).
 *
 * What it does:
 * - Provides signup/login endpoints that issue Bearer JWTs.
 * - Protects Coral resources with auth middleware, role checks, and ownership checks.
 * - Demonstrates secure write flows by deriving ownerId from token, not client input.
 */

import bcrypt from 'bcryptjs';
import Coral from 'coral';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

type UserRole = 'member' | 'admin';

interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: UserRole;
  };
}

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

// User schema with hashed password storage only.
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

// Secure notes are protected with JWT middleware before Coral handlers.
const secureNoteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    visibility: {
      type: String,
      enum: ['private', 'team'],
      default: 'private',
    },
  },
  { timestamps: true },
);

secureNoteSchema.index({ ownerId: 1, createdAt: -1 });

const AuthUser = mongoose.model('AuthUser', userSchema);
const SecureNote = mongoose.model('SecureNote', secureNoteSchema);

// This mirrors old "Bearer token" flow from zingy-api, but with modern jwt package usage.
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

    req.auth = {
      userId,
      role: payload.role === 'admin' ? 'admin' : 'member',
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

const requireRole = (role: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || req.auth.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

const attachOwnerOnCreate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  // Force ownership from JWT; clients cannot inject ownerId arbitrarily.
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    req.body = {};
  }

  if (req.method === 'POST' && req.auth?.userId) {
    req.body.ownerId = req.auth.userId;
  }

  next();
};

const blockOwnerReassignmentOnUpdate = (
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
    // Keep owner immutable after create.
    delete req.body.ownerId;
  }

  next();
};

const ensureOwnerOnWrite = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return next();
  }

  const noteId = req.params.idAttribute;
  if (!req.auth?.userId || !noteId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const note = await SecureNote.findById(noteId).select('ownerId').lean();
  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (String(note.ownerId) !== req.auth.userId) {
    return res.status(403).json({ message: 'Only note owner can modify this resource' });
  }

  next();
};

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { email, password, displayName } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
  };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password || !displayName || password.length < 8) {
    return res
      .status(400)
      .json({ message: 'email, displayName and password(>=8 chars) are required' });
  }

  const existing = await AuthUser.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    return res.status(409).json({ message: 'Email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await AuthUser.create({
    email: normalizedEmail,
    passwordHash,
    displayName,
    role: 'member',
  });

  const token = jwt.sign({ role: user.role }, JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(user._id),
    expiresIn: '14d',
  });

  res.status(201).json({ token });
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await AuthUser.findOne({ email: normalizedEmail }).select('+passwordHash').exec();
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: user.role }, JWT_SECRET, {
    algorithm: 'HS256',
    subject: String(user._id),
    expiresIn: '14d',
  });

  res.json({ token });
});

app.use(
  Coral({
    path: '/api/secure-notes',
    model: SecureNote,
    methods: ['POST', 'PUT', 'DELETE'],
    middlewares: [
      requireBearerToken,
      attachOwnerOnCreate,
      blockOwnerReassignmentOnUpdate,
      ensureOwnerOnWrite,
    ],
    bodyFilter: ['ownerId', 'title', 'content', 'visibility'],
    fields: 'ownerId title content visibility createdAt updatedAt',
  }),
);

// Separate admin route to show role-guarded Coral resources.
app.use(
  Coral({
    path: '/api/admin/users',
    model: AuthUser,
    methods: ['GET', 'PUT'],
    middlewares: [requireBearerToken, requireRole('admin')],
    bodyFilter: ['displayName', 'role'],
    fields: 'email displayName role createdAt updatedAt',
  }),
);

app.listen(3010, () => {
  console.log('auth-jwt-protected-routes running on http://localhost:3010');
});
