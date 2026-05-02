import { guardResponse } from "./guard.js";

/**
 * تقييم جودة الرد
 */
function scoreResponse(text) {
  let score = 100;

  if (!text) return 0;

  // طول غير كافي
  if (text.length < 30) score -= 30;

  // تكرار زائد
  const words = text.split(" ");
  const uniqueRatio = new Set(words).size / words.length;
  if (uniqueRatio < 0.5) score -= 25;

  // حشو عام (heuristic بسيط)
  if (text.includes("بشكل عام") || text.includes("يتم استخدامه في")) {
    score -= 15;
  }

  // إجابة بدون حل واضح
  if (!text.includes("؟") && !text.includes("حل") && !text.includes("خطوة")) {
    score -= 10;
  }

  return Math.max(score, 0);
}

/**
 * تحسين الرد قبل الإرسال
 */
function sanitize(text) {
  return text
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * القرار النهائي
 */
export function runtimeGate(responseText) {
  const cleaned = sanitize(responseText);

  const guard = guardResponse(cleaned);
  const score = scoreResponse(cleaned);

  // ❌ مرفوض
  if (!guard.ok) {
    return {
      ok: false,
      action: "reject",
      reason: guard.reason,
      score
    };
  }

  // 🔁 ضعيف → يحتاج إعادة توليد
  if (score < 60) {
    return {
      ok: false,
      action: "regenerate",
      reason: "low_quality",
      score
    };
  }

  // ✔ جيد
  return {
    ok: true,
    action: "accept",
    score
  };
}
