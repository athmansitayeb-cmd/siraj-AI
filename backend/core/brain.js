import { analyzeContext } from "./context.js";

export function buildSystemPrompt(messages) {
  const ctx = analyzeContext(messages);

  let base = `
أنت SIRAJ AI.
دقيق، صادق، واضح.
لا تخترع.
`;

  // 🎯 behavior based on context
  if (ctx.isTechnical) {
    base += `
تعامل كمبرمج خبير:
- حلول مباشرة
- خطوات واضحة
- لا تنظير
`;
  }

  if (ctx.level === "beginner") {
    base += `
اشرح ببساطة:
- لا تفترض معرفة مسبقة
`;
  }

  if (ctx.level === "advanced") {
    base += `
قدم إجابة عميقة:
- تفكير معماري
- optimization
`;
  }

  if (ctx.isRepeating) {
    base += `
المستخدم يكرر نفسه:
- لا تعيد نفس الجواب
- قدم زاوية جديدة أو حل مختلف
`;
  }

  return {
    role: "system",
    content: base
  };
}
