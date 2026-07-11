import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({

seo: {
  indexable: {
    type: Boolean,
    default: false
  },
  title: String,
  description: String,
  slug: String
},

version: {
  type: Number,
  default: 1
},

lastSessionAt: {
  type: Date,
  default: Date.now
},

  userId: {
    type: String,
    required: true
  },

  intent: {
    type: String,
    required: true
  },

conversationId: {
  type: String,
  required: true
},

  state: {
    type: String,
    default: "active"
  },

  funnelState: {
    type: String,
    default: "intent_captured"
  },

  agents: [{
    name: String,
    role: String,
    status: String
  }],

  messageCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

export default mongoose.model("Workspace", WorkspaceSchema);
