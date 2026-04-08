export function extractMemory(messages) {
  const last = messages.slice(-20);

  const memory = {
    topics: new Set(),
    intent: "general",
    userStyle: "normal"
  };

  const text = last.map(m => m.content).join(" ").toLowerCase();

  // ================= TOPICS =================
  const topicMap = {
    react: "frontend",
    vue: "frontend",
    angular: "frontend",

    server: "backend",
    api: "backend",
    endpoint: "backend",

    database: "database",
    mongo: "database",

    jwt: "security",
    auth: "security",

    ai: "ai"
  };

  for (const key in topicMap) {
    if (text.includes(key)) {
      memory.topics.add(topicMap[key]);
    }
  }

  // ================= INTENT (الأهم فقط) =================
  if (/(error|bug|fix|مشكلة|fail|crash)/.test(text)) {
    memory.intent = "problem_solving";
  } 
  else if (/(اشرح|ماهو|لماذا|كيف يعمل)/.test(text)) {
    memory.intent = "learning";
  } 
  else if (/(ابدأ|خطة|build|setup|how to start)/.test(text)) {
    memory.intent = "guidance";
  }

  // ================= STYLE (تبسيط القرار) =================
  if (memory.intent === "problem_solving") {
    memory.userStyle = "problem_solver";
  } 
  else if (memory.intent === "learning") {
    memory.userStyle = "needs_explanation";
  } 
  else {
    memory.userStyle = "normal";
  }

  return memory;
}
