export function buildPlan(cognition) {

  const tasks = [];

  // ================= CREATION =================
  if (cognition.intent === "creation") {

    tasks.push({
      type: "analysis",
      goal: "understand_request",
      priority: 1
    });

    tasks.push({
      type: "planning",
      goal: "generate_architecture",
      priority: 2
    });

  }

  // ================= DEBUG =================
  if (cognition.intent === "debug") {

    tasks.push({
      type: "diagnostic",
      goal: "find_root_cause",
      priority: 1
    });

  }

  return {
    strategy:
      cognition.intent === "creation"
        ? "builder_mode"
        : "adaptive",

    tasks
  };
}
