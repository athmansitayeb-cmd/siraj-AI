export function contextualForgetting(memory, msg) {
  const text = (msg || "").toLowerCase();

  const isImportant =
    /هدف|اريد|خطة|ابدأ|تغيير|نجاح|مشروع/.test(text);

  const isStruggle =
    /مشكل|تعبان|ضايع|قلق|فشلت|اعاني/.test(text);

  const isRepeated = (arr, item) => {
    if (!arr) return false;
    const last = arr.slice(-5);
    return last.filter(x => x === item).length >= 2;
  };

  // ================= FILTER LOGIC =================
  const filterMemory = (arr = []) => {
    return arr.filter(item => {
      if (!item) return false;

      // 1. لا نحذف المهم
      if (isImportant && item.length > 30) return true;

      // 2. لا نحذف ما يتكرر
      if (isRepeated(arr, item)) return true;

      // 3. نحذف القديم العشوائي
      return Math.random() > 0.3;
    }).slice(-10);
  };

  memory.goals = filterMemory(memory.goals);
  memory.struggles = filterMemory(memory.struggles);
  memory.habits = filterMemory(memory.habits);

  return memory;
}
