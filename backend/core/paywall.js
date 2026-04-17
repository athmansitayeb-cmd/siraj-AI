export function buildPaywall(reason, limits = {}) {
  const base = "لقد وصلت للحد المجاني.";

  const messages = {
    rate_limited: {
      title: "🚀 تم الوصول للحد اليومي",
      text: `${base} الترقية إلى Pro ترفع عدد الطلبات اليومية وتزيد السرعة.`,
    },

    daily_limit_reached: {
      title: "⚡ انتهى الاستخدام اليومي",
      text: `${base} يمكنك المتابعة عبر Pro بدون انقطاع.`,
    },

    cost_limit: {
      title: "💰 تم تجاوز حد الاستهلاك",
      text: `${base} Pro يمنحك سقف أعلى ونموذج أقوى.`,
    }
  };

  const p = messages[reason] || messages.rate_limited;

  return {
    ok: false,
    paywall: true,

    title: p.title,
    message: p.text,

    // بدل Stripe/ENV غير مستقر
    upgradeUrl: "/upgrade",

    meta: {
      reason,
      limits
    }
  };
}
