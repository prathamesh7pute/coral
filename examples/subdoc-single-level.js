/**
 * Example: Single-level sub-document routing.
 *
 * What it does:
 * - Stores comments as embedded sub-documents inside Article.
 * - Uses top-level idAttribute/idParam to locate the parent article by slug.
 * - Uses subDoc config to list/create/update/delete comment records.
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

const commentSchema = new mongoose.Schema(
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
    isPinned: { type: Boolean, default: false },
  },
  { _id: false, timestamps: true },
);

const articleSchema = new mongoose.Schema(
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
    comments: [commentSchema],
  },
  { timestamps: true },
);

articleSchema.index({ slug: 1 }, { unique: true });

const Article = mongoose.model('Article', articleSchema);

app.use(
  Coral({
    path: '/api/articles/:articleSlug/comments',
    model: Article,
    idAttribute: 'slug',
    idParam: 'articleSlug',
    bodyFilter: ['commentKey', 'authorName', 'body', 'isPinned'],
    subDoc: {
      path: 'comments',
      // For GET/PUT/DELETE single comment, Coral reads route :idAttribute.
      idAttribute: 'commentKey',
    },
  }),
);

// Examples:
// GET /api/articles/shipping-updates/comments
// GET /api/articles/shipping-updates/comments/c_abc12345
app.listen(3007, () => {
  console.log('subdoc-single-level running on http://localhost:3007');
});
