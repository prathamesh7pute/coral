/**
 * Example: Parent reference updates on create using updateRef.
 *
 * What it does:
 * - Creates Team and Project models with relational references.
 * - On POST /api/projects, Coral persists the project and updates Team.projects.
 * - Shows practical one-to-many linkage without custom controller boilerplate.
 */

import Coral from 'coral';
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

await mongoose.connect(process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/coral-examples');

// Team contains an array of project references.
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]{3,40}$/,
    },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
);

teamSchema.index({ slug: 1 }, { unique: true });

// Project stores foreign key + details.
const projectSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ['planned', 'active', 'paused', 'completed'],
      default: 'planned',
    },
    budgetUsd: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

projectSchema.index({ teamId: 1, createdAt: -1 });

const Team = mongoose.model('Team', teamSchema);
const Project = mongoose.model('Project', projectSchema);

app.use(
  Coral({
    path: '/api/projects',
    model: Project,
    methods: ['GET', 'POST'],
    bodyFilter: ['teamId', 'name', 'status', 'budgetUsd'],
    // On POST, Coral will push created project _id into Team.projects.
    updateRef: {
      model: Team,
      path: 'projects',
      findOneId: (req) => req.body.teamId,
    },
  }),
);

app.listen(3006, () => {
  console.log('update-ref running on http://localhost:3006');
});
