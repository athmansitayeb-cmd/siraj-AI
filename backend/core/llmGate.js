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

const graph = context?.graph || {};
const previousResults = context?.previousResults || [];
const workspace = context?.workspace || {};

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

// ================= DETERMINISTIC EXECUTION =================

if (
  task.type === "tool" ||
  task.type === "io"
) {
  return false;
}

if (
  previousResults.length &&
  !task.forceReasoning &&
  !task.forceLLM &&
  task.type !== "agent"
) {

  const success =
    previousResults.filter(r => r.status === "done").length;

  if (
    success >= (task.dependsOn?.length || 0)
  ) {
    return false;
  }

}

// Workspace غني بالمعلومات
if (
  workspace.memory &&
  workspace.knowledge &&
  (workspace.files?.length || 0) > 20
) {

  if (
    !task.forceReasoning &&
    agentName !== "planner" &&
    agentName !== "critic"
  ) {
    return false;
  }

}

  // ================= DEFAULT =================
  return true;

}
