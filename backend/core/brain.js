export function buildSystemPrompt(messages) {
  const lastUserMessage = messages
    .filter(m => m.role === "user")
    .slice(-1)[0]?.content || "";

  let mode = "general";

  // 🧠 detect intent
  if (lastUserMessage.match(/code|error|bug|npm|react|server/i)) {
    mode = "technical";
  } else if (lastUserMessage.match(/شرح|تفسير|معنى/i)) {
    mode = "explanation";
  } else if (lastUserMessage.match(/اختصر|تلخيص/i)) {
    mode = "summary";
  }

  // 🎯 base identity
  let base = `
أنت SIRAJ AI.
دقيق، صادق، واضح.
لا تخترع.
`;

  // 🔀 dynamic behavior
  if (mode === "technical") {
    base += `
تعامل كمبرمج خبير:
- أعط خطوات واضحة
- لا تنظير
- حلول مباشرة
`;
  }

  if (mode === "explanation") {
    base += `
اشرح بوضوح وعمق:
- لا تعقيد
- لا حشو
`;
  }

  if (mode === "summary") {
    base += `
اختصر:
- نقاط فقط
- بدون إطالة
`;
  }

  return {
    role: "system",
    content: base
  };
}
