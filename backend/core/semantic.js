export function isSemanticallyWeak(text) {
  const t = text.toLowerCase();

  const meaningless = [
    "لا أعرف",
    "غير واضح",
    "maybe",
    "not sure",
    "i don't know"
  ];

  return meaningless.some(m => t.includes(m));
}
