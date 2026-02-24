/**
 * Example: Multi-level nested sub-document routing.
 *
 * What it does:
 * - Models Discussion -> comments[] -> replies[] hierarchy.
 * - Locates parent discussion and target comment using idParam/idAttribute mapping.
 * - Uses recursive subDoc.subDoc config to operate on nested replies.
 * - Run: node examples/subdoc-multi-level.js
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

const replySchema = new mongoose.Schema(
  {
    replyKey: {
      type: String,
      required: true,
      trim: true,
      match: /^r_[a-z0-9]{6,30}$/,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1500,
    },
  },
  { _id: false, timestamps: true },
);

const threadCommentSchema = new mongoose.Schema(
  {
    commentKey: {
      type: String,
      required: true,
      trim: true,
      match: /^c_[a-z0-9]{6,30}$/,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    replies: [replySchema],
  },
  { _id: false, timestamps: true },
);

const discussionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,80}$/,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 160,
    },
    comments: [threadCommentSchema],
  },
  { timestamps: true },
);

discussionSchema.index({ slug: 1 }, { unique: true });

const Discussion = mongoose.model('Discussion', discussionSchema);

app.use(
  Coral({
    // Multi-level route: parent doc -> comment -> replies.
    path: '/api/discussions/:discussionSlug/comments/:commentKey/replies',
    model: Discussion,
    idAttribute: 'slug',
    idParam: 'discussionSlug',
    bodyFilter: ['replyKey', 'authorName', 'body'],
    subDoc: {
      path: 'comments',
      idAttribute: 'commentKey',
      idParam: 'commentKey',
      subDoc: {
        path: 'replies',
        idAttribute: 'replyKey',
      },
    },
  }),
);

app.listen(3008, () => {
  console.log('subdoc-multi-level running on http://localhost:3008');
});

/*
Sample requests (Node.js fetch):
- seed a Discussion with slug "api-design" and commentKey "c_alpha001" before these calls.

await fetch('http://localhost:3008/api/discussions/api-design/comments/c_alpha001/replies');

await fetch('http://localhost:3008/api/discussions/api-design/comments/c_alpha001/replies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    replyKey: 'r_beta001',
    authorName: 'Alex',
    body: 'We should benchmark this approach',
  }),
});

await fetch(
  'http://localhost:3008/api/discussions/api-design/comments/c_alpha001/replies/r_beta001',
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: 'We should benchmark this approach before rollout' }),
  },
);
*/
