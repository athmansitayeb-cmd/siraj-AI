import { extractMemory } from "./memory.js";
import { getPersonality } from "./personality.js";
import { analyzeContext } from "./context.js";

export function buildSystemPrompt(messages) {
  const ctx = analyzeContext(messages);
  const memory = extractMemory(messages);

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

let memoryLayer = "";

if (memory.topics.size > 0) {
  memoryLayer += `
المستخدم مهتم بـ: ${Array.from(memory.topics).join(", ")}
`;
}

if (memory.userStyle === "needs_explanation") {
  memoryLayer += `
المستخدم يحتاج شرح واضح ومبسط
`;
}

if (memory.userStyle === "problem_solver") {
  memoryLayer += `
المستخدم يركز على حل المشاكل مباشرة
`;
}


  return {
    role: "system",
    content: base + behavior + memoryLayer + personality
  };
}
