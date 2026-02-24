/**
 * Example: Basic Coral CRUD API.
 *
 * What it does:
 * - Creates a production-style Product schema with validations, indexes, and timestamps.
 * - Mounts Coral on /api/products to auto-generate CRUD routes.
 * - Uses bodyFilter and perPage to demonstrate safe write controls and pagination defaults.
 * - Run: node examples/basic-crud.js
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Product schema with validations, indexes, nested pricing, and timestamps.
const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9-]{4,30}$/,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    price: {
      amount: { type: Number, required: true, min: 0 },
      currency: {
        type: String,
        enum: ['USD', 'EUR', 'GBP'],
        default: 'USD',
      },
    },
    inventory: {
      inStock: { type: Number, default: 0, min: 0 },
      reorderLevel: { type: Number, default: 10, min: 0 },
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
  },
  { timestamps: true },
);

productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ status: 1, 'price.amount': 1 });

const Product = mongoose.model('Product', productSchema);

app.use(
  Coral({
    path: '/api/products',
    model: Product,
    perPage: 20,
    bodyFilter: ['sku', 'name', 'description', 'price', 'inventory', 'tags', 'status'],
  }),
);

app.listen(3000, () => {
  console.log('basic-crud running on http://localhost:3000');
});

/*
Sample requests (Node.js fetch):
- default methods generate GET/POST on /api/products and GET/PUT/DELETE on /api/products/:idAttribute.
- replace <productId> with an actual document id.

await fetch('http://localhost:3000/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sku: 'PRD-1001',
    name: 'Noise Cancelling Headphones',
    description: 'Over-ear ANC headphones',
    price: { amount: 199, currency: 'USD' },
    inventory: { inStock: 40, reorderLevel: 8 },
    tags: ['audio', 'premium'],
    status: 'active',
  }),
});

await fetch('http://localhost:3000/api/products?limit=10&sort=createdAt&order=desc');

await fetch('http://localhost:3000/api/products/<productId>', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Noise Cancelling Headphones v2', status: 'active' }),
});
*/
