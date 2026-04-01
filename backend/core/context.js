export function analyzeContext(messages) {
  const lastMessages = messages.slice(-6);

  let context = {
    isTechnical: false,
    isRepeating: false,
    level: "normal"
  };

  const combined = lastMessages.map(m => m.content).join(" ").toLowerCase();

  // detect technical
  if (combined.match(/error|bug|code|server|react|npm/)) {
    context.isTechnical = true;
  }

  // detect repetition
  const last = lastMessages[lastMessages.length - 1]?.content;
  const previous = lastMessages[lastMessages.length - 2]?.content;

  if (last && previous && last === previous) {
    context.isRepeating = true;
  }

  // detect level
  if (combined.match(/ماهو|اشرح|لماذا/)) {
    context.level = "beginner";
  }

  if (combined.match(/optimize|architecture|scaling/)) {
    context.level = "advanced";
  }

  return context;
}
