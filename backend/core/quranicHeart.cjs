function applyQuranicHeart(message, intent, state) {
  if (intent.intent === "greeting") {
    return {
      tone: "warm",
      value: "السلام وبث الطمأنينة",
      response: "وعليكم السلام ورحمة الله",
      signature: "SIRAJ"
    };
  }

  return {
    tone: "neutral",
    value: "الحكمة",
    response: "حدثني أكثر",
    signature: "SIRAJ"
  };
}

module.exports = { applyQuranicHeart };
