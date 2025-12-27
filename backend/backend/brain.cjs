import { getIntent } from './core/intent.cjs';
import { state } from './core/state.cjs';
import { decide } from './core/decision.cjs';

/**
 * دالة لمعالجة نص الإدخال وإرجاع القرار النهائي
 * @param {string} input - نص المستخدم
 * @returns {object} - النتيجة مع النية والإجراء
 */
export function processInput(input) {
  const intent = getIntent(input);   // استخرج النية من الإدخال
  const action = decide(intent, state); // حدد الإجراء بناءً على النية والحالة
  return { input, intent, action };
}

// مثال للتجربة في الطرفية
if (import.meta.url === `file://${process.argv[1]}`) {
  const testInput = "مرحباً";
  const result = processInput(testInput);
  console.log("=== اختبار Brain ===");
  console.log(result);
}
