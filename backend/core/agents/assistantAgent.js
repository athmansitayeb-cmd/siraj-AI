import { registerAgent } from "../agentRegistry.js";
import crypto from "crypto";
import { groq } from "../groqClient.js";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY missing");
}


// ================= SIMPLE CACHE (LOW COST OPTIMIZATION) =================
const cache = new Map();

function hash(text) {
  return crypto.createHash("md5").update(text).digest("hex");
}

// ================= FAST RESPONSES (NO LLM) =================
function tryFastReply(input) {

  const text = String(input).toLowerCase().trim();

  if (text === "hi" || text === "hello") {
    return "Hello, how can I help you?";
  }

  if (text.includes("who are you")) {
    return "I am SIRAJ AI assistant.";
  }

  if (text.length < 3) {
    return "Input too short.";
  }

  return null;
}

registerAgent("assistant", {
  description: "General conversation agent (optimized)",

  async execute({ input, context }) {

const raw = String(
  input?.original ||
  input?.instruction ||
  input ||
  ""
).trim();

const systemPrompt =
  context?.systemPrompt || {
    role: "system",
    content: "You are SIRAJ AI."
  };

    const key = hash(raw);

    // ================= CACHE HIT =================
    if (cache.has(key)) {
      return {
        ok: true,
        text: cache.get(key),
        cached: true
      };
    }

    // ================= FAST PATH =================
    const fast = tryFastReply(raw);
    if (fast) {
      cache.set(key, fast);

if (cache.size > 500) {
  const first = cache.keys().next().value;
  cache.delete(first);
}

      return {
        ok: true,
        text: fast,
        fast: true
      };
    }

    // ================= LLM CALL (ONLY WHEN NEEDED) =================
    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
           systemPrompt,
          {
            role: "user",
            content: raw.slice(0, 2000)
          }
        ],
        temperature: 0.6
      });

    const content =
      completion?.choices?.[0]?.message?.content ??
      "";

    cache.set(key, content);

if (cache.size > 500) {
  const first = cache.keys().next().value;
  cache.delete(first);
}

    return {
      ok: true,
      text: content,
data: {
  model: "llama-3.3-70b-versatile",
  finishReason:
    completion?.choices?.[0]?.finish_reason || "stop"
}
    };
  }
});
