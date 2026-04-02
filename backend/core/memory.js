export function extractMemory(messages) {
  const last = messages.slice(-20);

  let memory = {
    topics: new Set(),
    userStyle: "normal"
  };

  const text = last.map(m => m.content).join(" ").toLowerCase();

  // topics
  if (text.includes("react")) memory.topics.add("react");
  if (text.includes("server")) memory.topics.add("backend");
  if (text.includes("ai")) memory.topics.add("ai");

if (text.includes("api") || text.includes("endpoint")) memory.topics.add("backend");
if (text.includes("database") || text.includes("mongo")) memory.topics.add("database");
if (text.includes("jwt") || text.includes("auth")) memory.topics.add("security");

  // user style
  if (text.match(/اشرح|ماهو|لماذا/)) {
    memory.userStyle = "needs_explanation";
  }

  if (text.match(/fix|error|bug/)) {
    memory.userStyle = "problem_solver";
  }

  return memory;
}
