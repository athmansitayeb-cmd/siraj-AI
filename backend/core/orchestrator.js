import { getUserMemory } from "./userMemory.js";
import Groq from "groq-sdk";
import { buildSystemPrompt } from "./brain.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function orchestrate({ convo, msg, userId }) {
  try {
    if (!msg || typeof msg !== "string") {
      return { ok: false, reason: "invalid_input" };
    }

    const recent = convo
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content }));

    const userMemory = await getUserMemory(userId);

    const systemPrompt = buildSystemPrompt(convo, userId, userMemory);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        systemPrompt,
        ...recent
      ],
      temperature: 0.6,
      max_tokens: 700,
      stream: true
    });

let fullText = "";

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

for await (const chunk of completion) {
  const content = chunk?.choices?.[0]?.delta?.content;
  if (content) fullText += content;
}

return { ok: true, text: fullText };
 
    } catch (e) {
    console.error("[ORCHESTRATOR ERROR]", e);
    return { ok: false, reason: "orchestrator_fail" };
  }
}
