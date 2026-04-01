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

  // user style
  if (text.match(/اشرح|ماهو|لماذا/)) {
    memory.userStyle = "needs_explanation";
  }

  if (text.match(/fix|error|bug/)) {
    memory.userStyle = "problem_solver";
  }

  return memory;
}
