import { guardResponse } from "./guard.js";

/**
 * تقييم جودة الرد
 */
function scoreResponse(text) {
  let score = 100;

  if (!text) return 0;

  if (text.length < 30) score -= 30;

  const words = text.split(" ");
  const uniqueRatio = new Set(words).size / words.length;

  if (uniqueRatio < 0.5) score -= 25;

  if (
    text.includes("بشكل عام") ||
    text.includes("يتم استخدامه")
  ) {
    score -= 15;
  }

  if (
    !text.includes("خطوة") &&
    !text.includes("حل") &&
    !text.includes("؟")
  ) {
    score -= 10;
  }

  return Math.max(score, 0);
}

function sanitize(text) {
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export function runtimeGate(responseText) {
  const cleaned = sanitize(responseText);

  const guard = guardResponse(cleaned);
  const score = scoreResponse(cleaned);

  if (!guard.ok) {
    return {
      ok: false,
      action: "reject",
      reason: guard.reason,
      score
    };
  }

  if (score < 60) {
    return {
      ok: false,
      action: "regenerate",
      reason: "low_quality",
      score
    };
  }

  return {
    ok: true,
    action: "accept",
    score
  };
}
