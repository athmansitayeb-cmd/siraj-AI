export function isNoise(text) {
  const clean = text.replace(/\s/g, "");

  if (!clean.length) return true;

  // نسبة رموز غريبة
  const weirdChars = clean.match(/[^a-zA-Z0-9\u0600-\u06FF]/g) || [];
  const weirdRatio = weirdChars.length / clean.length;

  if (weirdRatio > 0.6) return true;

  // تكرار حرف بشكل غير طبيعي
  if (/(.)\1{6,}/.test(clean)) return true;

  return false;
}
