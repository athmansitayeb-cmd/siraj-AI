export function buildCognition({ msg, memory, workspace }) {

  const text = (msg || "").toLowerCase();

  // ================= PERCEPTION =================
  let intent = "general";
  let emotionalState = "stable";
  let urgency = "normal";
  let objective = null;

  // ================= INTENT =================
  if (/كيف|اشرح|ماهو/.test(text)) {
    intent = "learning";
  }

  if (/ابني|اصنع|نفذ|أنشئ/.test(text)) {
    intent = "creation";
  }

  if (/خطأ|bug|مشكلة/.test(text)) {
    intent = "debug";
  }

  // ================= STATE =================
  if (/ضايع|مشتت/.test(text)) {
    emotionalState = "confused";
  }

  if (/مستعجل|بسرعة|حالاً/.test(text)) {
    urgency = "high";
  }

  // ================= OBJECTIVE =================
  if (/مشروع|منصة|تطبيق/.test(text)) {
    objective = "build_system";
  }

  return {
    intent,
    emotionalState,
    urgency,
    objective,

    signals: {
      hasCodeIntent:
        /api|backend|frontend|server|react|node/.test(text),

      wantsExecution:
        /نفذ|ابدأ|ابني/.test(text),

      businessIntent:
        /عملاء|شركة|مشروع|ربح/.test(text)
    }
  };
}
