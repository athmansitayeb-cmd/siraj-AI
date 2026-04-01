export function guardResponse(text, context = {}) {
  if (!text || typeof text !== "string") {
    return { ok: false, reason: "empty_response" };
  }

  const trimmed = text.trim();

  // 1. منع الردود الفارغة أو الضعيفة
  if (trimmed.length < 10) {
    return { ok: false, reason: "too_short" };
  }

  // 2. منع التكرار المفرط
  const words = trimmed.split(" ");
  const uniqueWords = new Set(words);

  if (uniqueWords.size / words.length < 0.4) {
    return { ok: false, reason: "repetitive" };
  }

  // 3. منع الهلوسة الواضحة (أنماط خطيرة)
  const badPatterns = [
    "I think maybe",
    "maybe possibly",
    "not sure but",
    "could be anything"
  ];

  for (const p of badPatterns) {
    if (trimmed.toLowerCase().includes(p.toLowerCase())) {
      return { ok: false, reason: "low_confidence" };
    }
  }

  // 4. تحقق بسيط من التماسك
  if (trimmed.split(".").length > 15 && trimmed.length < 200) {
    return { ok: false, reason: "fragmented_response" };
  }

  return { ok: true };
}
