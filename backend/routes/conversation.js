import express from "express";
import Conversation from "../models/Conversation.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// AUTH middleware (نفس النظام عندك)
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "unauthorized" });

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
};

// MAIN CHAT HISTORY
router.get("/main-chat", requireAuth, async (req, res) => {
  try {
    const convo = await Conversation.findOne({
      userId: req.user.id,
      conversationId: "main-chat"
    });

    if (!convo) {
      return res.json({
        id: "main-chat",
        messages: []
      });
    }

    res.json({
      id: "main-chat",
      messages: convo.messages
    });

  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
});

// GENERIC CHAT HISTORY
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const convo = await Conversation.findOne({
      userId: req.user.id,
      conversationId: req.params.id
    });

    if (!convo) {
      return res.json({
        id: req.params.id,
        messages: []
      });
    }

    res.json({
      id: convo.conversationId,
      messages: convo.messages
    });

  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
});

// ================== POST CHAT MESSAGE ==================
router.post("/", requireAuth, async (req, res) => {
  try {
    const { message, conversationId = "main-chat" } = req.body;

    if (!message) return res.status(400).json({ error: "Message missing" });

    let convo = await Conversation.findOne({
      userId: req.user.id,
      conversationId
    });

    if (!convo) {
      convo = await Conversation.create({
        userId: req.user.id,
        conversationId,
        messages: []
      });
    }

    convo.messages.push({ role: "user", content: message });
    convo.messages = convo.messages.slice(-50); // حفظ آخر 50 رسالة
    await convo.save();

    res.json({
      ok: true,
      conversationId: convo.conversationId,
      messages: convo.messages
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
