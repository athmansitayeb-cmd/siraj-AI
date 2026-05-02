import { buildState } from "./stateEngine.js";
import { buildPrompt } from "./promptEngine.js";
import { getUserMemory } from "./userMemory.js";

/**
 * SIRAJ COGNITIVE CORE v2
 * يحوّل كل شيء إلى قرار واضح قبل الذكاء الاصطناعي
 */

export async function buildCognitiveContext({ convo, msg, userId }) {

  const userMemory = await getUserMemory(userId);

  // 1. الحالة السلوكية
  const state = buildState(convo, msg);

  // 2. وزن المستخدم (اختياري للتطوير لاحقاً)
  const weight = computeUserWeight(userMemory);

  // 3. إعداد prompt ذكي
  const systemPrompt = buildPrompt({
    userMemory,
    mode: state.mode,
    pattern: state.pattern,
    weight
  });

  return {
    systemPrompt,
    state,
    userMemory
  };
}

/**
 * مقياس بسيط للسلوك (بداية فقط)
 */
function computeUserWeight(memory) {
  let score = 50;

  if ((memory?.goals || []).length > 3) score += 10;
  if ((memory?.struggles || []).length > 3) score -= 10;
  if (memory?.lastState === "motivated") score += 10;
  if (memory?.lastState === "victim_mode") score -= 15;

  return Math.max(0, Math.min(100, score));
}
