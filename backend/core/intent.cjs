// core/intent.cjs

function normalizeTokens(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === "string") return input.split(/\s+/);
  if (input && Array.isArray(input.tokens)) return input.tokens;
  return [];
}

function scoreIntent(tokens) {
  let score = 0;
  for (const token of tokens) {
    if (["السلام", "مرحبا", "أهلا"].includes(token)) {
      score++;
    }
  }
  return score;
}

function getIntent(input) {
  const tokens = normalizeTokens(input);
  const score = scoreIntent(tokens);

  if (score > 0) {
    return { intent: "greeting", confidence: Math.min(1, score / 2) };
  }

  return { intent: "unknown", confidence: 0.1 };
}

module.exports = { getIntent };
