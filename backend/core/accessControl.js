export function getAccess(plan) {
  const plans = {
    free: {
      model: "llama-3.3-70b-versatile",
      memory: false
    },
    pro: {
      model: "llama-3.3-70b-versatile",
      memory: true
    }
  };

  return plans[plan] || plans.free;
}
