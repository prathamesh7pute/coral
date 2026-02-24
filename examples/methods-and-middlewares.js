/**
 * Example: Method restriction and middleware chaining.
 *
 * What it does:
 * - Defines an Invoice model with practical field constraints.
 * - Applies request logging and API-key authentication middleware before Coral handlers.
 * - Restricts generated routes to GET, POST, and PUT using methods.
 * - Run: node examples/methods-and-middlewares.js
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Invoice schema with strict statuses and reference-like external IDs.
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^INV-[0-9]{6}$/,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ['USD', 'EUR'], default: 'USD' },
    status: {
      type: String,
      enum: ['draft', 'issued', 'paid', 'voided'],
      default: 'draft',
    },
  },
  { timestamps: true },
);

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ customerEmail: 1, createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Middleware 1: lightweight request logging for generated routes.
const requestLogger = (req, _res, next) => {
  console.log(`[invoice-api] ${req.method} ${req.originalUrl}`);
  next();
};

// Middleware 2: API key auth for protected internal endpoints.
const requireInternalApiKey = (req, res, next) => {
  const expected = process.env.INTERNAL_API_KEY;
  if (!expected) {
    return res.status(500).json({ message: 'INTERNAL_API_KEY is not configured' });
  }

  if (req.headers['x-api-key'] !== expected) {
    return res.status(401).json({ message: 'Invalid API key' });
  }

  next();
};

app.use(
  Coral({
    path: '/api/invoices',
    model: Invoice,
    // DELETE is intentionally disabled for immutable invoice history.
    methods: ['GET', 'POST', 'PUT'],
    middlewares: [requestLogger, requireInternalApiKey],
    fields: 'invoiceNumber customerEmail totalAmount currency status createdAt updatedAt',
    bodyFilter: ['invoiceNumber', 'customerEmail', 'totalAmount', 'currency', 'status'],
  }),
);

app.listen(3001, () => {
  console.log('methods-and-middlewares running on http://localhost:3001');
});

/*
Sample requests (Node.js fetch):
- methods: ['GET', 'POST', 'PUT'] generates only these three routes.
- set INTERNAL_API_KEY and replace <invoiceId>.

await fetch('http://localhost:3001/api/invoices', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.INTERNAL_API_KEY,
  },
  body: JSON.stringify({
    invoiceNumber: 'INV-100001',
    customerEmail: 'billing@acme.com',
    totalAmount: 499.99,
    currency: 'USD',
    status: 'issued',
  }),
});

await fetch('http://localhost:3001/api/invoices?sort=createdAt&order=desc', {
  headers: { 'x-api-key': process.env.INTERNAL_API_KEY },
});

await fetch('http://localhost:3001/api/invoices/<invoiceId>', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.INTERNAL_API_KEY,
  },
  body: JSON.stringify({ status: 'paid' }),
});
*/
