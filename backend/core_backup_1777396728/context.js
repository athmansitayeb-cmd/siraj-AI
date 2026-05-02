export function analyzeContext(messages) {
  const lastMessages = messages.slice(-6);

  let context = {
    isTechnical: false,
    isRepeating: false,
    level: "normal"
  };

  const combined = lastMessages.map(m => m.content).join(" ").toLowerCase();

  // TECH
  if (combined.match(/error|bug|code|server|react|npm|api|database/)) {
    context.isTechnical = true;
  }

  // REPETITION
  const last = lastMessages[lastMessages.length - 1]?.content;
  const previous = lastMessages[lastMessages.length - 2]?.content;

  if (last && previous && last === previous) {
    context.isRepeating = true;
  }

  // LEVEL ONLY
  if (combined.match(/ماهو|اشرح|لماذا|كيف/)) {
    context.level = "beginner";
  }

  if (combined.match(/optimize|architecture|scaling/)) {
    context.level = "advanced";
  }

  return context;
}
