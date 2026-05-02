export function isSemanticallyWeak(text) {
  if (!text) return true;

  const t = text.toLowerCase();

  // ❌ عبارات نصائح عامة
  const genericAdvice = [
    "حاول",
    "يمكنك",
    "ابدأ",
    "من الجيد",
    "لا تقلق",
    "خذ وقتك",
    "خطوة صغيرة",
    "لماذا لا",
    "you can",
    "try to",
    "start by"
  ];

  // ❌ غياب التحليل (لا يوجد نمط أو سلوك)
  const noPattern =
    !t.includes("نمط") &&
    !t.includes("سلوك") &&
    !t.includes("تكرر");

  // ❌ غياب سؤال
  const noQuestion = !t.includes("?") && !t.includes("؟");

  // ❌ غياب مواجهة
  const noConfront =
    !t.includes("أنت") &&
    !t.includes("انت") &&
    !t.includes("تفعل");

  const genericDetected = genericAdvice.some(w => t.includes(w));

  if (genericDetected) return true;

const tooGeneric = genericAdvice.some(w => t.includes(w));

if (tooGeneric) return true;
if (genericDetected) return true;

  return false;
}
