/**
 * Example: Query defaults and runtime query overrides.
 *
 * What it does:
 * - Sets default conditions/options/fields for Incident listing APIs.
 * - Adds query defaults via query config merged with top-level defaults.
 * - Demonstrates how request params (sort/order/select/page) override defaults at runtime.
 * - Run: node examples/query-defaults-and-overrides.js
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

// Why this config exists:
// - Multi-tenant APIs usually need fixed base filters to avoid accidental cross-tenant data access.
// - List endpoints often need predictable default sorting and projection for dashboard performance.
// - Some defaults should still be overridable by query params for flexible reporting screens.
//
// How Coral merges this:
// - top-level conditions/options/fields are the base.
// - query.conditions/query.options/query.fields are merged on top.
// - runtime query params like ?sort, ?order, ?select, ?page, ?limit can override final query behavior.
//
// Practical use cases:
// - Incident response dashboards that should show only active incidents by default.
// - Customer-facing monitoring APIs where payload size and sort order need controlled defaults.
// - Backoffice tools that occasionally override projection/sort from URL params.
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

app.listen(3003, () => {
  console.log('query-defaults-and-overrides running on http://localhost:3003');
});

/*
Sample requests (Node.js fetch):
- 1) Create a record that matches base + query defaults.
- 2) Use runtime sort override for severity-prioritized views.
- 3) Use select/page override to return compact paginated payload.
- Expected default read behavior (without query params):
  tenantId='t_acme001', archived=false, status in ['open','investigating'], sort by -createdAt.

await fetch('http://localhost:3003/api/incidents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tenantId: 't_acme001',
    title: 'API error spikes in EU region',
    severity: 'high',
    status: 'open',
    archived: false,
  }),
});

await fetch('http://localhost:3003/api/incidents?sort=severity&order=desc');
await fetch('http://localhost:3003/api/incidents?select=title,status,severity&page=1');
*/
