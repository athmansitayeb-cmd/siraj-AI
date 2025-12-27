function processNLP(input) {
  const tokens = input.split(/\s+/);
  return {
    original: input,
    normalized: input.toLowerCase(),
    tokens,
    features: {
      length: tokens.length,
      hasQuestion: input.includes('?'),
      emotional: false
    }
  };
}
module.exports = { processNLP };
