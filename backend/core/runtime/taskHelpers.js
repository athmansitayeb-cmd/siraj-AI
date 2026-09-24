export function shouldSkipExecution(task) {

  if (task.type === "synthesis") {
    return false;
  }

  const input =
    typeof task.input === "string"
      ? task.input.trim()
      : "";

  if (!input) {
    return true;
  }

  if (
    task.type === "reasoning" &&
    input.length < 5
  ) {
    return true;
  }

  return false;
}

// ============================================================
// LLM DECISION
// ============================================================

export function shouldForceLLM(task) {

  const input =
    typeof task.input === "string"
      ? task.input.toLowerCase()
      : "";

  if (task.type === "synthesis") {
    return true;
  }

  if (
    input.includes("fix") ||
    input.includes("repair") ||
    input.includes("bug") ||
    input.includes("error") ||
    input.includes("review")
  ) {
    return true;
  }

  if (
    (task.dependsOn || []).length > 1
  ) {
    return true;
  }

  if (task.agent === "critic") {
    return true;
  }

  return false;
}

// ============================================================
// DEPENDENCY CONTEXT
// ============================================================

export function getDependencyResults(
  task,
  graph
) {

  return (task.dependsOn || [])
    .map(depId => {

      const node =
        graph.nodes[depId];

      if (!node) {
        return {
          id: depId,
          result: null
        };
      }

      return {
        id: depId,
        status: node.status,
        result: node.result
      };

    });
}

// ============================================================
// FULL GRAPH RESULTS
// ============================================================

export function getGraphResults(graph) {

  return Object.values(graph.nodes)
    .map(node => ({
      id: node.id,
      type: node.type,
      agent: node.agent,
      status: node.status,
      result: node.result,
      error: node.error
    }));
}

// ============================================================
// VALIDATE TASK
// ============================================================

export function validateTask(
  task,
  availableAgents
) {

  if (!task?.id) {
    return {
      ok: false,
      reason: "missing_task_id"
    };
  }

  if (!task.type) {
    return {
      ok: false,
      reason: "missing_task_type"
    };
  }

  if (task.type === "agent") {

    if (!task.agent) {
      return {
        ok: false,
        reason: "missing_agent"
      };
    }

    if (
      !availableAgents.has(
        task.agent
      )
    ) {
      return {
        ok: false,
        reason:
          `unknown_agent:${task.agent}`
      };
    }
  }

  if (
    task.type === "tool" &&
    !task.tool
  ) {
    return {
      ok: false,
      reason: "missing_tool"
    };
  }

  return {
    ok: true
  };
}
