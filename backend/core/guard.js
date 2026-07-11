import { isSemanticallyWeak } from "./semantic.js";

export function guardResponse(text) {
  if (!text || text.trim().length < 10) {
    return { ok: false, reason: "too_short" };
  }

  if (isSemanticallyWeak(text)) {
    return { ok: false, reason: "weak_semantics" };
  }

  const words = text.split(" ");
  const unique = new Set(words);

  if (words.length > 0 && unique.size / words.length < 0.4) {
    return { ok: false, reason: "repetition" };
  }

  return { ok: true };
}
