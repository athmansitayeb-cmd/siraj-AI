import { getPersonality } from "./personality.js";
import { analyzeContext } from "./context.js";

export function buildSystemPrompt(messages) {
  const ctx = analyzeContext(messages);

  let base = `
أنت SIRAJ AI.
دقيق، صادق، واضح.
لا تخترع.
`;

  let behavior = "";

  if (ctx.isTechnical) {
    behavior += `
تعامل كمبرمج خبير:
- حلول مباشرة
- خطوات واضحة
- لا تنظير
`;
  }

  if (ctx.level === "beginner") {
    behavior += `
اشرح ببساطة
`;
  }

  if (ctx.level === "advanced") {
    behavior += `
تحليل عميق + هندسة
`;
  }

  if (ctx.isRepeating) {
    behavior += `
لا تعيد نفس الجواب
`;
  }

  const personality = getPersonality();

  return {
    role: "system",
    content: base + behavior + personality
  };
}
