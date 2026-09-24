export function getAccess(plan) {
  const plans = {
    free: {
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      memory: false
    },
    pro: {
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      memory: true
    }
  };

  return plans[plan] || plans.free;
}
