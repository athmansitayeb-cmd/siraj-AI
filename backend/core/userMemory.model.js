import mongoose from "mongoose";

const userMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  goals: { type: [String], default: [] },
  struggles: { type: [String], default: [] },
  habits: { type: [String], default: [] },
  lastState: { type: String, default: "" },

  checkins: { type: [String], default: [] },

  stateHistory: { type: [String], default: [] },

  lastCheckAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },

  // 🔥 NEW
  lastActiveAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserMemory", userMemorySchema);
