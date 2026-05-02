import { getAccess } from "./accessControl.js";
import { getUserPlan } from "./entitlements.js";
import { buildPaywall } from "./paywall.js";
import { getUserMemory } from "./userMemory.js";
import Groq from "groq-sdk";
import { buildSystemPrompt } from "./brain.js";
import { runtimeGate } from "./runtime.js";
import crypto from "crypto";
import { buildUsageLog } from "./tokenMeter.js";
import { buildState } from "./stateEngine.js";
import { buildPrompt } from "./promptEngine.js";
import { buildCognitiveContext } from "./cognitiveCore.js";

function addSmartEmoji(text, userMemory) {
  if (!text) return text;

  const t = text.toLowerCase();

  // 🔥 ربط الحالة النفسية (لو موجودة)
  const state = userMemory?.lastState;

  // ===== حالات عامة =====
  if (t.includes("نجح") || t.includes("أحسنت") || t.includes("ممتاز")) {
    return text + " 💪";
  }

  if (t.includes("ابدأ") || t.includes("خطوة") || t.includes("حل")) {
    return text + " 🚀";
  }

  if (t.includes("فهم") || t.includes("شرح") || t.includes("تفكير")) {
    return text + " 🧠";
  }

  if (t.includes("خطأ") || t.includes("مشكلة") || t.includes("فشل")) {
    return text + " ⚠️";
  }

  if (t.includes("تذكير") || t.includes("قلت")) {
    return text + " 📌";
  }

  // ===== حالات نفسية من memoryExtractor =====
  if (state === "lost") return text + " 🧭";
  if (state === "anxious") return text + " 🧘";
  if (state === "low_energy") return text + " 🔋";
  if (state === "motivated") return text + " 🔥";
  if (state === "victim_mode") return text + " 🧠";

  return text;
}

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
    // ================= BASIC VALIDATION =================
    if (!msg || typeof msg !== "string") {
      return { ok: false, reason: "invalid_input" };
    }

    if (msg.length < 2) {
      return { ok: false, reason: "too_short" };
    }


const rateKey = `rate:${userId}`;
const usageKey = `usage:${userId}`;

const plan = await getUserPlan(userId, redis);
const access = getAccess(plan);

// ===== RATE + COST LIMIT =====
if (redis) {
  // RATE
  const count = await redis.incr(rateKey);

  if (count === 1) {
    await redis.expire(rateKey, 60);
  }

  const rateCheck = access.checkRateLimit(count);
  if (rateCheck?.blocked) {
    return buildPaywall(rateCheck.reason, {
      ...access,
      current: count
    });
  }

  // COST
  const used = Number(await redis.get(usageKey) || 0);

  const costCheck = access.checkCostLimit(used);
  if (costCheck?.blocked) {
    return buildPaywall(costCheck.reason, {
      ...access,
      current: used
    });
  }
}

// ===== MODEL =====
const model = access.model;

    // ================= CACHE KEY =================
    const cacheKey = `ai:${userId}:${crypto
      .createHash("sha256")
      .update(msg + model + "v1")
      .digest("hex")}`;

    // ================= CACHE CHECK =================
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return { ok: true, text: cached, cached: true };
      }
    }

    // ================= CONTEXT =================
    const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const userMemory = await getUserMemory(userId);

const cognitive = await buildCognitiveContext({
  convo,
  msg,
  userId
});

const systemPrompt = cognitive.systemPrompt;

const lastMsg = convo?.slice(-1)?.[0]?.content;

if (lastMsg === msg) {
  return {
    ok: true,
    text: "لا تكرر نفس السؤال. غيّر المدخل."
  };
}

    // ================= AI CALL =================
    const completion = await getGroq().chat.completions.create({
      model,
      messages: [systemPrompt, ...recent],
      temperature: 0.7,
      max_tokens: 400,
      stream: false
    });

    let fullText =
      completion?.choices?.[0]?.message?.content || "";

    let finalText = fullText;

    // ================= RUNTIME GATE =================
    const gate = runtimeGate(fullText);

    if (!gate.ok && gate.action === "regenerate") {
      const retry = await getGroq().chat.completions.create({
        model,
        messages: [
          systemPrompt,
          ...recent,
          { role: "user", content: "Be more direct and clearer." }
        ],
        temperature: 0.5,
        max_tokens: 300
      });

      finalText =
        retry?.choices?.[0]?.message?.content || fullText;
    }

    // ================= SMART REMINDER =================
    if (userMemory?.goals?.length && msg.length < 120) {
      finalText += `

تذكير: قلت أنك تريد ${userMemory.goals.slice(-1)[0]} — هل تقدمت؟`;
    }

    // ================= TOKEN TRACK =================
    const usage = buildUsageLog({
      prompt: msg,
      response: finalText,
      model
    });

    console.log("AI_USAGE", {
      userId,
      ...usage
    });

    // ================= UPDATE DAILY COST =================
    if (redis) {
      await redis.incrByFloat(usageKey, usage.cost);
      await redis.expire(usageKey, 86400);
    }

    // ================= MEMORY EXTRACTION =================
    if (access.memory && msg.length > 40) {
      try {
        const { extractUserMemory } = await import("./memoryExtractor.js");
        const { updateUserMemory } = await import("./userMemory.js");

        const extracted = await extractUserMemory(msg);

        if (extracted) {
          await updateUserMemory(userId, extracted);
        }
      } catch (e) {
        console.error("[MEMORY EXTRACT FAIL]", e);
      }
    }

    // ================= CACHE SAVE =================
    if (redis && finalText) {
      await redis.setEx(cacheKey, 600, finalText);
    }

// ================= ACCOUNTABILITY =================
if (userMemory?.goals?.length) {
  const lastGoal = userMemory.goals.slice(-1)[0];

  const lastCheck = userMemory.lastCheckAt
    ? new Date(userMemory.lastCheckAt).getTime()
    : 0;

  const now = Date.now();

  // بعد ~3 دقائق (تجربة أولية)
  if (now - lastCheck > 3 * 60 * 1000) {
    finalText += `

قلت أنك تريد: ${lastGoal}
ماذا فعلت فيه حتى الآن؟`;
  }
}

    return { ok: true, text: addSmartEmoji(finalText, userMemory) };

  } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "orchestrator_fail" };
  }
}
