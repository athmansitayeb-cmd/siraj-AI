import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },

  intent: {
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
