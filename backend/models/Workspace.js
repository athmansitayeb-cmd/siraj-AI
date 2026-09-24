import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({

  // ==========================================================
  // IDENTITY
  // ==========================================================

  userId: {
    type: String,
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  intent: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  // ==========================================================
  // SESSION
  // ==========================================================

  conversationId: {
    type: String,
    required: true
  },

  lastSessionAt: {
    type: Date,
    default: Date.now
  },

  messageCount: {
    type: Number,
    default: 0
  },

  // ==========================================================
  // WORKSPACE STATE
  // ==========================================================

  state: {
    type: String,
    enum: [
      "active",
      "paused",
      "archived"
    ],
    default: "active",
    index: true
  },

  funnelState: {
    type: String,
    default: "intent_captured"
  },

  // ==========================================================
  // RUNTIME
  // ==========================================================

  runtimeState: {
    type: String,
    enum: [
      "idle",
      "planning",
      "executing",
      "reflecting",
      "repairing",
      "completed",
      "failed"
    ],
    default: "idle"
  },

  version: {
    type: Number,
    default: 1
  },

  // ==========================================================
  // AGENTS
  // ==========================================================

  agents: [{
    name: String,
    role: String,
    status: {
      type: String,
      default: "idle"
    }
  }],

  // ==========================================================
  // SEO
  // ==========================================================

  seo: {
    indexable: {
      type: Boolean,
      default: false
    },

    title: String,

    description: String,

    slug: {
      type: String,
      index: true
    }
  }

}, {
  timestamps: true
});

export default mongoose.model(
  "Workspace",
  WorkspaceSchema
);
