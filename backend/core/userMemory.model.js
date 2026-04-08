import mongoose from "mongoose";

const userMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },

  goals: { type: [String], default: [] },
  struggles: { type: [String], default: [] },
  habits: { type: [String], default: [] },
  lastState: { type: String, default: "" },

  updatedAt: Date
});

export default mongoose.model("UserMemory", userMemorySchema);
