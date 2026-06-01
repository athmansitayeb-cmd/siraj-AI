export const PLANS = {
  free: {
    id: "free",
    title: "FREE",
    price: 0,
    color: "green",
    features: [
      "Single workspace",
      "Basic AI access",
      "Short-term memory",
      "Community support",
    ],
  },

  pro: {
    id: "pro_monthly",
    title: "PRO",
    price: 19,
    color: "blue",
    popular: true,
    features: [
      "Persistent memory system",
      "Advanced workflows",
      "Multi-step execution",
      "Priority runtime access",
      "Agent orchestration",
    ],
  },

  proPlus: {
    id: "pro_plus",
    title: "PRO+",
    price: 49,
    color: "purple",
    features: [
      "Everything in PRO",
      "Long-term memory expansion",
      "Advanced reasoning layer",
      "Higher compute priority",
      "Enhanced automation stack",
    ],
  },

  enterprise: {
    id: "enterprise",
    title: "ENTERPRISE",
    price: null,
    color: "cyan",
    features: [
      "Private AI infrastructure",
      "Custom deployment",
      "Enterprise integrations",
      "Dedicated scaling support",
      "Advanced security controls",
    ],
  },
};
