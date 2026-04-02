import mongoose from "mongoose";

const userMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  facts: [String],
  preferences: Object,
  profile: Object,
  updatedAt: Date
});

export default mongoose.model("UserMemory", userMemorySchema);
