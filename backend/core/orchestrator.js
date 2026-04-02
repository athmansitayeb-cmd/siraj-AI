import Groq from "groq-sdk";
import { buildSystemPrompt } from "./brain.js";
import { runtimeGate } from "./runtime.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function orchestrate({ convo, msg }) {
  try {
    if (!msg || typeof msg !== "string") {
      return { ok: false, reason: "invalid_input" };
    }

    const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const systemPrompt = buildSystemPrompt(convo);

    const preCheck = runtimeGate(msg);
    if (!preCheck.ok && preCheck.action === "reject") {
      return { ok: false, reason: preCheck.reason };
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [systemPrompt, ...recent],
      temperature: 0.6,
      max_tokens: 700,
      stream: true
    });

    return { ok: true, stream: completion };

  } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "orchestrator_fail" };
  }
}
