import mongoose from "mongoose";

const MemoryItem = new mongoose.Schema(
  {
    text: String,
    importance: { type: Number, default: 0.5 }, // 0 → 1
    type: { type: String, default: "episodic" }, // episodic | semantic
    time: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },

    messages: {
      type: Array,
      default: [],
    },

    memory: {
      summary: { type: String, default: "" },
      items: { type: [MemoryItem], default: [] },
    },

    profile: {
      facts: { type: Object, default: {} }, // اسم، اهتمام، نمط...
      lastInteraction: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
