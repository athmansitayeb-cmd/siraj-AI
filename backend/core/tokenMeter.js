/**
 * Token Meter - SIRAJ Cost Tracking
 * simple approximation (not perfect but عملي)
 */

export function estimateTokens(text = "") {
  if (!text) return 0;

  // تقريبي: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * حساب تكلفة حسب نموذج Groq
 */
export function estimateCost(tokens, model = "llama-3.3-70b-versatile") {
  // أسعار تقريبية (تتغير حسب Groq)
  const pricing = {
    "llama-3.3-70b-versatile": {
      input: 0.00059 / 1000,
      output: 0.00079 / 1000
    },
    "llama-3.1-8b-instant": {
      input: 0.00005 / 1000,
      output: 0.00008 / 1000
    }
  };

  const p = pricing[model] || pricing["llama-3.3-70b-versatile"];

  // نفترض نصف input نصف output (تقريب عملي)
  const inputTokens = tokens * 0.6;
  const outputTokens = tokens * 0.4;

  const cost =
    inputTokens * p.input +
    outputTokens * p.output;

  return Number(cost.toFixed(8));
}

/**
 * سجل استخدام كامل
 */
export function buildUsageLog({ prompt, response, model }) {
  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(response);

  const totalTokens = inputTokens + outputTokens;

  const cost = estimateCost(totalTokens, model);

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    cost,
    model,
    timestamp: new Date()
  };
}
