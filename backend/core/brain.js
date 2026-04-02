import { extractMemory } from "./memory.js";
import { getPersonality } from "./personality.js";
import { analyzeContext } from "./context.js";

/**
 * تنظيف نص
 */
const clean = (t) => t.replace(/\s+/g, " ").trim();

/**
 * منع تلاصق العربية والإنجليزية
 */
const bilingualFix = (t) =>
  t
    .replace(/([\u0600-\u06FF])([A-Za-z0-9])/g, "$1 | $2")
    .replace(/([A-Za-z0-9])([\u0600-\u06FF])/g, "$1 | $2");

/**
 * حذف التكرار داخل البرومبت
 */
const uniqueLines = (text) => {
  const seen = new Set();
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    })
    .join("\n");
};

/**
 * تحويل السياق إلى “حالة تشغيل”
 */
function buildOperatingState(ctx) {
  return {
    mode: ctx.isTechnical ? "ENGINEERING" : "GENERAL",
    level: ctx.level || "normal",
    repetition: ctx.isRepeating || false,
    strict: true
  };
}

/**
 * بناء نواة التفكير
 */
function buildCore(state) {
  return `
[SYSTEM CORE]

You are SIRAJ AI, a deterministic reasoning engine.

RULES (non-negotiable):
- No filler text.
- No repetition of ideas.
- No generic explanations.
- No hallucinated facts.
- If uncertain: say "UNKNOWN".

REASONING FLOW (mandatory):
1. Interpret intent.
2. Extract key constraints.
3. Produce minimal valid solution.

OUTPUT STYLE:
- Direct.
- Structured.
- Minimal but complete.
`;
}

/**
 * وضع الهندسة
 */
function buildEngineeringMode(state) {
  if (state.mode !== "ENGINEERING") return "";

  return `
[ENGINEERING MODE]

- Diagnose before answering.
- Prefer root cause over description.
- Provide actionable fix only.
- Avoid theory unless requested.
`;
}

/**
 * مستوى المستخدم
 */
function buildLevel(state) {
  if (state.level === "beginner") {
    return `
[SIMPLIFIED MODE]
- Short sentences.
- No complex terms.
`;
  }

  if (state.level === "advanced") {
    return `
[ADVANCED MODE]
- Deep analysis allowed.
- Multi-solution if relevant.
`;
  }

  return "";
}

/**
 * منع التكرار
 */
function buildRepetitionGuard(state) {
  if (!state.repetition) return "";

  return `
[ANTI-REPETITION]
- Change approach completely.
- Do not reuse previous phrasing.
`;
}

/**
 * الذاكرة (تحويلها إلى إشارة لا نص)
 */
function buildMemory(memory) {
  if (!memory.topics?.size) return "";

  return `
[MEMORY SIGNAL]
topics=${Array.from(memory.topics).join(",")}
style=${memory.userStyle || "neutral"}
`;
}

/**
 * عقد الإخراج النهائي (مهم جداً)
 */
function buildOutputContract() {
  return `
[OUTPUT CONTRACT]
- No introductions.
- No closing phrases.
- One idea per line.
- Answer first, explain only if necessary.
`;
}

/**
 * بناء البرومبت النهائي
 */
export function buildSystemPrompt(messages) {
  const ctx = analyzeContext(messages);
  const memory = extractMemory(messages);
  const personality = getPersonality();
  const state = buildOperatingState(ctx);

  let prompt = [
    buildCore(state),
    buildEngineeringMode(state),
    buildLevel(state),
    buildRepetitionGuard(state),
    buildMemory(memory),
    buildOutputContract(),
    personality
  ]
    .filter(Boolean)
    .map(clean)
    .join("\n\n");

  prompt = uniqueLines(prompt);
  prompt = bilingualFix(prompt);

  return {
    role: "system",
    content: prompt
  };
}
