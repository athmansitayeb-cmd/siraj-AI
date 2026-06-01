export function buildTaskPlan(msg = "") {

  const text = msg.toLowerCase();

  let type = "conversation";
  let steps = [];
  let priority = "normal";

  if (/site|website|landing|واجهة|موقع/.test(text)) {
    type = "build_website";

    steps = [
      "analyze_requirements",
      "design_structure",
      "generate_components",
      "prepare_deployment"
    ];
  }

  else if (/agent|automation|workflow|بوت/.test(text)) {
    type = "automation_agent";

    steps = [
      "understand_goal",
      "define_tools",
      "build_logic",
      "prepare_execution"
    ];
  }

  else if (/bug|error|خطأ|مشكلة/.test(text)) {
    type = "debug";

    steps = [
      "inspect_issue",
      "locate_failure",
      "propose_fix"
    ];

    priority = "high";
  }

  return {
    type,
    priority,
    steps,
    createdAt: Date.now()
  };
}
