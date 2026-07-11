export function isNoise(text) {
  if (!text) return true;

  const t = text.toLowerCase().trim();

  if (t.length < 15) return true;

  const noisePatterns = [
    "lorem",
    "test",
    "asdf",
    "....",
    "؟؟؟؟"
  ];

  const repetitive =
    new Set(t.split(" ")).size / t.split(" ").length < 0.5;

  return noisePatterns.some(p => t.includes(p)) || repetitive;
}
