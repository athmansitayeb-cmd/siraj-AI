export function getAccess(plan) {
  const plans = {
    free: {
      rpm: 10,
      dailyCost: 0.01,
      model: "llama-3.1-8b-instant",
      memory: false
    },

    pro: {
      rpm: 40,
      dailyCost: 0.5,
      model: "llama-3.3-70b-versatile",
      memory: true
    }
  };

  const limits = plans[plan] || plans.free;

  return {
    ...limits,

    checkRateLimit(count) {
      if (count > limits.rpm) {
        return { blocked: true, reason: "rate_limited" };
      }
      return null;
    },

    checkCostLimit(used) {
      if (used > limits.dailyCost) {
        return { blocked: true, reason: "cost_limit" };
      }
      return null;
    }
  };
}
