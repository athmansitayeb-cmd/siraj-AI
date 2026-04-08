import { getUserMemory } from "./userMemory.js";
import Groq from "groq-sdk";
import { buildSystemPrompt } from "./brain.js";
import crypto from "crypto";
import { buildUsageLog } from "./tokenMeter.js";

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

// ================= MODEL =================
    const model = "llama-3.1-8b-instant";

    // ================= CACHE KEY =================
    const cacheKey = `ai:${userId}:${crypto
      .createHash("sha256")
      .update(msg + model)
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

    // ================= CONTEXT =================
    const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const userMemory = await getUserMemory(userId);

    const systemPrompt = buildSystemPrompt(convo, userId, userMemory);

    // ================= AI CALL =================
    const completion = await getGroq().chat.completions.create({
      model,
      messages: [
        systemPrompt,
        ...recent
      ],
      temperature: 0.7,
      max_tokens: 400,
      stream: false
    });

    const fullText =
      completion?.choices?.[0]?.message?.content || "";
    let finalText = fullText;

if (userMemory?.goals?.length && msg.length < 120) {
  finalText += `

تذكير: قلت أنك تريد ${userMemory.goals.slice(-1)[0]} — هل تقدمت؟`;
}

    // ================= TOKEN + COST TRACKING =================
    const usage = buildUsageLog({
      prompt: msg,
      response: fullText,
      model
    });

    console.log("AI_USAGE", {
      userId,
      ...usage
    });

    // ================= MEMORY EXTRACTION (SMART) =================
    let extracted = null;

    if (msg.length > 40) {
      try {
        const { extractUserMemory } = await import("./memoryExtractor.js");
        const { updateUserMemory } = await import("./userMemory.js");

        extracted = await extractUserMemory(msg);

        if (extracted) {
          await updateUserMemory(userId, extracted);
        }
      } catch (e) {
        console.error("[MEMORY EXTRACT FAIL]", e);
      }
    }

    // ================= SAVE CACHE =================
    if (redis && fullText) {
      await redis.setEx(cacheKey, 600, fullText); // 10 min
    }

    return { ok: true, text: finalText };

  } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "orchestrator_fail" };
  }
}
