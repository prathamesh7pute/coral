/**
 * Example: Request body whitelisting with bodyFilter.
 *
 * What it does:
 * - Defines a Customer schema with internal/server-managed fields.
 * - Allows clients to write only selected fields (email, fullName, phone).
 * - Prevents mass-assignment of privileged fields like role or internal notes.
 * - Run: node examples/body-filter.js
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Customer schema contains internal fields we do not want clients to set directly.
const customerSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
      match: /^$|^\+?[0-9\s-]{7,20}$/,
    },
    role: {
      type: String,
      enum: ['customer', 'support', 'admin'],
      default: 'customer',
    },
    internalNotes: {
      type: String,
      default: '',
      maxlength: 3000,
    },
    creditScore: {
      type: Number,
      min: 0,
      max: 1000,
      default: 500,
    },
  },
  { timestamps: true },
);

customerSchema.index({ email: 1 }, { unique: true });

const Customer = mongoose.model('Customer', customerSchema);

app.use(
  Coral({
    path: '/api/customers',
    model: Customer,
    methods: ['GET', 'POST', 'PUT'],
    // Only whitelisted keys are persisted from req.body.
    // role/internalNotes/creditScore remain server-controlled.
    bodyFilter: ['email', 'fullName', 'phone'],
  }),
);

app.listen(3005, () => {
  console.log('body-filter running on http://localhost:3005');
});

/*
Sample requests (Node.js fetch):
- methods: ['GET', 'POST', 'PUT'] generates only these three routes.
- replace <customerId> with an actual document id.

await fetch('http://localhost:3005/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jane@example.com',
    fullName: 'Jane Doe',
    phone: '+1-415-555-1001',
    role: 'admin',
    internalNotes: 'should-be-ignored',
  }),
});

await fetch('http://localhost:3005/api/customers?select=email,fullName,role');

await fetch('http://localhost:3005/api/customers/<customerId>', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'Jane A. Doe', creditScore: 900 }),
});
*/
