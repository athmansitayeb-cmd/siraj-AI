export const PLANS = {
  pro_monthly: {
    label: "Pro Monthly",
    price: "5.00",
    currency: "USD",
    paypalPlanId: process.env.PAYPAL_PLAN_PRO_MONTHLY,
    systemPlan: "pro"
  },

  pro_yearly: {
    label: "Pro Yearly",
    price: "40.00",
    currency: "USD",
    paypalPlanId: process.env.PAYPAL_PLAN_PRO_YEARLY,
    systemPlan: "pro"
  }
};
