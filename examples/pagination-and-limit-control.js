/**
 * Example: Pagination behavior and limit capping.
 *
 * What it does:
 * - Builds an AuditLog model for time-ordered read-heavy APIs.
 * - Configures perPage to control page size for ?page-based pagination.
 * - Highlights Coral's safety cap for oversized ?limit requests.
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Audit log schema optimized for time-ordered listing.
const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      required: true,
      trim: true,
      match: /^usr_[a-z0-9]{6,30}$/,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    resourceType: {
      type: String,
      enum: ['project', 'task', 'file', 'user', 'team'],
      required: true,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

app.use(
  Coral({
    path: '/api/audit-logs',
    model: AuditLog,
    // page uses this size, and limit is capped to perPage * 10.
    perPage: 50,
    query: {
      options: {
        sort: '-createdAt',
      },
    },
  }),
);

// Query examples:
// GET /api/audit-logs?page=2   -> skip 100, limit 50
// GET /api/audit-logs?limit=800 -> capped to 500
app.listen(3004, () => {
  console.log('pagination-and-limit-control running on http://localhost:3004');
});
