import { getAccess } from "./accessControl.js";
import { getUserPlan } from "./entitlements.js";
import { buildPaywall } from "./paywall.js";
import { getUserMemory } from "./userMemory.js";
import Groq from "groq-sdk";
import crypto from "crypto";
import { guardResponse } from "./guard.js";
import { buildUsageLog } from "./tokenMeter.js";
import { buildSirajCore } from "./sirajCore.js";
import { buildMemoryGraph } from "./memoryGraph.js";
import { reasonDecision } from "./reasoningEngine.js";
import { updateFeedback } from "./feedbackLoop.js";

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

// ================= ORCHESTRATOR =================
export async function orchestrate({ convo, msg, userId, redis }) {
  try {

    // ================= VALIDATION =================
    if (!msg || typeof msg !== "string") {
      return { ok: false, reason: "invalid_input" };
    }

    if (msg.length < 2) {
      return { ok: false, reason: "too_short" };
    }

    // ================= PLAN + ACCESS =================
    const plan = await getUserPlan(userId, redis);
    const access = getAccess(plan);

    const rateKey = `rate:${userId}`;
    const usageKey = `usage:${userId}`;

    // ================= RATE LIMIT =================
    if (redis) {
      const count = await redis.incr(rateKey);
      if (count === 1) await redis.expire(rateKey, 60);

      const rateCheck = access.checkRateLimit(count);
      if (rateCheck?.blocked) {
        return buildPaywall(rateCheck.reason, { current: count });
      }

      const used = Number(await redis.get(usageKey) || 0);
      const costCheck = access.checkCostLimit(used);

      if (costCheck?.blocked) {
        return buildPaywall(costCheck.reason, { current: used });
      }
    }

    // ================= CACHE =================
    const cacheKey = `ai:${userId}:${crypto
      .createHash("sha256")
      .update(msg + plan + "v1")
      .digest("hex")}`;

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return { ok: true, text: cached, cached: true };
    }

    // ================= MEMORY =================
    const userMemory = await getUserMemory(userId);
    const graph = buildMemoryGraph(userMemory);
    const focus = graph?.dominantGoal || null;
    const risk = graph?.mainStruggle || null;

// ================= CORE + REASONING =================
const tempCore = buildSirajCore({
  convo,
  msg,
  memory: userMemory
});

const reasoning = reasonDecision({
  state: tempCore.state,
  intent: tempCore.intent,
  mode: tempCore.mode,
  focus,
  risk
});

const core = buildSirajCore({
  convo,
  msg,
  memory: userMemory,
  reasoning,
  focus
});

// 🔥 override mode بالقرار الحقيقي
if (!focus && !risk) {
  reasoning.mode = "respond";
}
 
   const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

const lastUserMsgs = convo
  .filter(m => m.role === "user")
  .slice(-5)
  .map(m => m.content.toLowerCase());

const repeatedFailure =
  lastUserMsgs.filter(m => m.includes("فشلت")).length >= 2;

if (repeatedFailure) {
  core.systemPrompt.content += `
ALERT:
User is repeating failure pattern → confront directly. Do NOT comfort.
`;
}

// ================= AI CALL (SMART LOOP) =================
let attempts = 0;
const maxAttempts = 2;

let text = "";
let lastCandidate = "";

while (attempts < maxAttempts) {

  const retryHint = "Be clearer and more specific.";

  const messages = [
    core.systemPrompt,
    ...recent.slice(-10),
    ...(attempts > 0
      ? [{ role: "system", content: retryHint }]
      : [])
  ];

  const completion = await getGroq().chat.completions.create({
    model: access.model,
    messages,
    temperature: attempts === 0 ? 0.5 : 0.3,
    max_tokens: 220
  });

  const candidate = completion?.choices?.[0]?.message?.content || "";
  lastCandidate = candidate;

  const check = guardResponse(candidate);

  if (check.ok) {
    text = candidate;
    break;
  }

  attempts++;
}
 
 // بدل تضخيم prompt → فقط توجيه خفيف
  recent.push({
    role: "user",
    content: "Re-evaluate and respond more clearly and concisely."
  });

// fallback
if (!text || text.length < 15) {
  text = lastCandidate || "Unable to generate response.";
}

    // ================= USAGE =================
    const usage = buildUsageLog({
      prompt: msg,
      response: text,
      model: access.model
    });

    if (redis) {
      await redis.incrByFloat(usageKey, usage.cost);
      await redis.expire(usageKey, 86400);
    }

// ================= MEMORY UPDATE =================
function shouldRunMemoryExtraction(msg, userMemory) {
  const msgText = msg.toLowerCase();

  const strongSignals =
    /اريد|هدفي|اعاني|مشكل|تعبان|ضايع|فشلت|بدأت/.test(msgText);

  const meaningful = msg.length > 70;

  const stateChange =
    userMemory?.lastState &&
    userMemory.lastState !== "normal";

  const lastCheck = userMemory?.lastCheckAt
    ? Date.now() - new Date(userMemory.lastCheckAt).getTime()
    : Infinity;

  const cooldownOk = lastCheck > 1000 * 60 * 30;

  return (strongSignals && meaningful && cooldownOk) || stateChange;
}

// ================= MEMORY UPDATE =================
const shouldExtract = shouldRunMemoryExtraction(msg, userMemory);

if (access.memory && shouldExtract) {
  try {
    const { extractUserMemory } = await import("./memoryExtractor.js");
    const { updateUserMemory } = await import("./userMemory.js");

    const extracted = await extractUserMemory(msg);
    if (extracted) await updateUserMemory(userId, extracted);

  } catch (e) {
    console.error("[MEMORY FAIL]", e);
  }
}

    // ================= FEEDBACK LOOP =================
    await updateFeedback(userMemory, msg, text);

    // ================= CACHE SAVE =================
    if (redis) {
      await redis.setEx(cacheKey, 600, text);
    }

    return {
      ok: true,
      text
    };

  } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "internal_error" };
  }
}
