import { getUserMemory } from "./userMemory.js";
import Groq from "groq-sdk";
import { buildSystemPrompt } from "./brain.js";
import crypto from "crypto";

let groq;

function getGroq() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY missing at runtime");
  }

  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groq;
}

export async function orchestrate({ convo, msg, userId, redis }) {
  try {
    if (!msg || typeof msg !== "string") {
      return { ok: false, reason: "invalid_input" };
    }

    // ================= CACHE KEY =================
    const cacheKey = `ai:${userId}:${crypto
      .createHash("sha256")
      .update(msg)
      .digest("hex")}`;

    // ================= REDIS CACHE CHECK =================
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return {
          ok: true,
          text: cached,
          cached: true
        };
      }
    }

    const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const userMemory = await getUserMemory(userId);

    const systemPrompt = buildSystemPrompt(convo, userId, userMemory);

const completion = await getGroq().chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    systemPrompt,
    ...recent
  ],
  temperature: 0.6,
  max_tokens: 700,
  stream: false
});

const fullText =
  completion?.choices?.[0]?.message?.content || "";

    const { extractUserMemory } = await import("./memoryExtractor.js");
    const { updateUserMemory } = await import("./userMemory.js");

    let extracted = null;

    try {
      extracted = await extractUserMemory(msg);
    } catch (e) {
      console.error("[MEMORY EXTRACT FAIL]", e);
    }

    if (extracted) {
      await updateUserMemory(userId, extracted);
    }

    // ================= SAVE CACHE =================
    if (redis && fullText) {
      await redis.setEx(cacheKey, 600, fullText); // 10 min cache
    }

    return { ok: true, text: fullText };

  } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "orchestrator_fail" };
  }
}
