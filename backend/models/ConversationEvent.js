import mongoose from "mongoose";

const ConversationEventSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, index: true },
  userId: { type: String, index: true },

  type: {
    type: String,
    enum: [
      "user_message",
      "assistant_message",
      "system_event"
    ]
  },

  content: String,

  metadata: Object,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model("ConversationEvent", ConversationEventSchema);
