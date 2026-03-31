import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: String,
    time: { type: Date, default: Date.now }
  },
  { _id: false }
);

const MemoryItem = new mongoose.Schema(
  {
    text: String,
    importance: { type: Number, default: 0.5 },
    time: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },

    conversationId: { type: String, index: true }, // 🔥 أهم إضافة

    title: { type: String, default: "New Chat" },

    messages: { type: [MessageSchema], default: [] },

    memory: {
      summary: { type: String, default: "" },
      items: { type: [MemoryItem], default: [] }
    }
  },
  { timestamps: true }
);

// منع التكرار
ConversationSchema.index({ userId: 1, conversationId: 1 }, { unique: true });

export default mongoose.model("Conversation", ConversationSchema);
