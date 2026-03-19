import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  userId: String,
  messages: Array,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", ChatSchema);
