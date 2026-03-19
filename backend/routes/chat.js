import express from "express";
import Groq from "groq-sdk";
import Chat from "../models/Chat.js";

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

router.post("/", async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ msg: "Message required" });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are SIRAJ Ultra AI, elite, precise, and intelligent."
        },
        ...history,
        { role: "user", content: message }
      ],
    });

    const reply = completion.choices[0].message.content;

    // حفظ في MongoDB
    await Chat.create({
      userId: "guest",
      messages: [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: reply }
      ]
    });

    res.json({ reply });

  } catch (err) {
    console.error("GROQ ERROR:", err);
    res.status(500).json({ msg: "AI Error" });
  }
});

export default router;
