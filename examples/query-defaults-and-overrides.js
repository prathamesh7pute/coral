/**
 * Example: Query defaults and runtime query overrides.
 *
 * What it does:
 * - Sets default conditions/options/fields for Incident listing APIs.
 * - Adds query defaults via query config merged with top-level defaults.
 * - Demonstrates how request params (sort/order/select/page) override defaults at runtime.
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Incident model with enum fields and indexes suited for dashboard queries.
const incidentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      trim: true,
      match: /^t_[a-z0-9]{6,30}$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 180,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved'],
      default: 'open',
    },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

incidentSchema.index({ tenantId: 1, status: 1, severity: -1, createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);

app.use(
  Coral({
    path: '/api/incidents',
    model: Incident,
    perPage: 25,
    // Base defaults used for all generated operations.
    conditions: {
      tenantId: 't_acme001',
      archived: false,
    },
    options: {
      sort: '-createdAt',
    },
    fields: 'title severity status createdAt',
    // Additional query defaults merged with top-level defaults.
    query: {
      conditions: {
        status: { $in: ['open', 'investigating'] },
      },
      options: {
        limit: 20,
      },
      fields: 'title severity status tenantId createdAt',
    },
  }),
);

// Runtime override examples:
// GET /api/incidents?sort=severity&order=desc
// GET /api/incidents?select=title,status,severity
// GET /api/incidents?page=1
app.listen(3003, () => {
  console.log('query-defaults-and-overrides running on http://localhost:3003');
});
