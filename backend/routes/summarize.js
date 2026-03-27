import express from "express";
import verifyToken from "../middleware/auth.js";
import { summarizeConversation } from "../services/summarizer.js";

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const { conversationId } = req.body;
  if (!conversationId) return res.status(400).json({ msg: "Conversation ID required" });

  try {
    const summary = await summarizeConversation(conversationId);
    res.json({ summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "خطأ أثناء تلخيص المحادثة" });
  }
});

export default router;
