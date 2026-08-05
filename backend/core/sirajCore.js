export function buildSirajCore({ convo, msg, memory = {}, reasoning = {}, focus = null }) {

  const text = (msg || "").toLowerCase();

  // ================= STATE (خفيف بدون over-engineering) =================
  let state = "normal";

  if (/ضايع|مشتت|ماعرف/.test(text)) state = "lost";
  else if (/خايف|قلق|توتر/.test(text)) state = "anxious";
  else if (/تعبان|مافي طاقة/.test(text)) state = "low_energy";
  else if (/بدأت|أبغى أبدأ|خطة/.test(text)) state = "initiating";
  else if (/ليش|ظلم|ليش أنا/.test(text)) state = "frustration";

  // ================= INTENT =================
let intent = "conversation";

if (
  /(build|create|generate|develop|design|software|system|project|application|website|dashboard|frontend|backend|database|api|crm|saas|platform|أنشئ|ابن|اصنع|طور|صمم|مشروع|تطبيق|موقع|واجهة|قاعدة بيانات|برمج)/i.test(text)
) {
  intent = "software";
}
else if (/كيف|اشرح|ماهو|لماذا|what|why|how/i.test(text)) {
  intent = "learn";
}
else if (/مشكلة|bug|خطأ|error|fix|repair/i.test(text)) {
  intent = "debug";
}
else if (/ابدأ|خطة|نفذ/i.test(text)) {
  intent = "execute";
}

  // ================= MODE (خفيف بدون فرض سلوك) =================
  let mode = "adaptive";

  if (state === "lost") mode = "clarify";
  else if (intent === "debug") mode = "diagnose";

  // ================= MEMORY =================
  const goals = memory?.goals?.slice(-3).join(", ") || "none";
  const struggles = memory?.struggles?.slice(-3).join(", ") || "none";
  const lastState = memory?.lastState || "unknown";

  // ================= SYSTEM PROMPT =================
  const system = `
SIRAJ v6

STATE: ${state}
INTENT: ${intent}
MODE: ${reasoning?.mode || mode}

FOCUS: ${focus || "none"}

MEMORY:
Goals: ${goals}
Struggles: ${struggles}
State: ${lastState}

---

OUTPUT PRINCIPLE:

- Respond naturally based on context
- Do NOT use fixed structure
- Do NOT force questions or actions
- Keep responses short and meaningful
- Avoid repetition of style or phrasing
- Do not over-analyze simple messages
- If useful → include question OR action (not both necessarily)

---

IMPORTANT:

Think first, format last.
`;

  return {
    systemPrompt: { role: "system", content: system },
    state,
    mode,
    intent
  };
}
