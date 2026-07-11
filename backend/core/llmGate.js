const DEFAULT_LLM_AGENTS = new Set([
  "assistant",
  "planner",
  "research",
  "architect",
  "frontend",
  "backend",
  "critic",
  "repair"
]);

// ================= SIMPLE DETECTOR =================
function isSimpleTask(input = "") {

  const text = String(input)
    .trim()
    .toLowerCase();

  return (
    text.length <= 2 ||
    [
      "hi",
      "hello",
      "ok",
      "thanks",
      "yes",
      "no"
    ].includes(text)
  );

}

// ================= MAIN GATE =================
export function shouldUseLLM(agentName, context = {}) {

  const input =
    context?.task?.input ||
    context?.input ||
    "";

  const task = context?.task || {};

  // ================= MANUAL OVERRIDES =================
  if (context.forceLLM === true) {
    return true;
  }

  if (context.forceLLM === false) {
    return false;
  }

  // ================= AGENT POLICY =================
  if (!DEFAULT_LLM_AGENTS.has(agentName)) {
    return false;
  }

  // ================= SIMPLE TASK =================
  if (isSimpleTask(input)) {
    return false;
  }

  // ================= SYNTHESIS =================
  if (task.type === "synthesis") {
    return true;
  }

  // ================= COMPLEX GRAPH =================
  if ((task.dependsOn || []).length > 1) {
    return true;
  }

  // ================= LONG CONTEXT =================
  if (String(input).length > 800) {
    return true;
  }

  // ================= DEFAULT =================
  return true;

}
