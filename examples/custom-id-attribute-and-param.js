/**
 * Example: Custom resource identifier mapping with idAttribute and idParam.
 *
 * What it does:
 * - Uses tenantSlug as the business identifier instead of Mongo _id.
 * - Reads tenantSlug from the route (/api/tenants/:tenantSlug/settings).
 * - Shows tenant-safe writes by attaching tenantSlug from path in middleware.
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// One settings document per tenant (tenantSlug is the natural identifier).
const tenantSettingsSchema = new mongoose.Schema(
  {
    tenantSlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,40}$/,
    },
    supportEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    timezone: {
      type: String,
      enum: ['UTC', 'America/New_York', 'Europe/London', 'Asia/Kolkata'],
      default: 'UTC',
    },
    brandingColor: {
      type: String,
      default: '#0f172a',
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  { timestamps: true },
);

tenantSettingsSchema.index({ tenantSlug: 1 }, { unique: true });

const TenantSettings = mongoose.model('TenantSettings', tenantSettingsSchema);

// Populate tenantSlug from the URL so clients cannot cross-tenant write by body spoofing.
const attachTenantSlugFromPath = (req, _res, next) => {
  if (req.params.tenantSlug && req.method === 'POST') {
    req.body.tenantSlug = req.params.tenantSlug;
  }

  next();
};

app.use(
  Coral({
    // The base path already contains :tenantSlug.
    path: '/api/tenants/:tenantSlug/settings',
    model: TenantSettings,
    idAttribute: 'tenantSlug',
    idParam: 'tenantSlug',
    methods: ['GET', 'POST'],
    middlewares: [attachTenantSlugFromPath],
    bodyFilter: ['tenantSlug', 'supportEmail', 'timezone', 'brandingColor'],
  }),
);

app.listen(3002, () => {
  console.log('custom-id-attribute-and-param running on http://localhost:3002');
});
