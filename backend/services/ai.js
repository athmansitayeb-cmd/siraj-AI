import { buildSystemPrompt } from "../core/brain.js";
import { SYSTEM_PROMPT } from "../core/systemPrompt.js";
import axios from "axios";

export async function fetchAI(prompt) {
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
           buildSystemPrompt([{ role: "user", content: prompt }]),
          { role: "user", content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("Groq Error:", err.response?.data || err.message);
    return "⚠️ خطأ في Groq";
  }
}
