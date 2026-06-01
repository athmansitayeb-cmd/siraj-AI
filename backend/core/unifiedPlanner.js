export function unifiedPlanner({
  msg,
  memory = {},
  workspace = {},
  reasoning = {}
}) {

  const text = msg.toLowerCase();

  // ================= INTENT =================
  let intent = "conversation";

  if (/ابحث|search|google|find/.test(text)) {
    intent = "search";
  }

  if (/ابني|اصنع|create|build|code/.test(text)) {
    intent = "build";
  }

  if (/حلل|analyze/.test(text)) {
    intent = "analysis";
  }

if (/research|بحث|analyze|study/.test(text)) {
  intent = "research";
}
  // ================= GOAL =================
  const goal =
    reasoning?.goal ||
    memory?.dominantGoal ||
    msg;

  const tasks = [];

  // ================= PLANNER NODE (FIXED) =================
  tasks.push({
    id: "t0",
    type: "reasoning",
    role: "planner",
    status: "pending",
    input: goal
  });

  // ================= INTENT TASKS =================

  if (intent === "search") {

    tasks.push({
      id: "t1",
      type: "tool",
      tool: "search",
      status: "pending",
      dependsOn: ["t0"],
      input: msg
    });
  }

if (intent === "build") {

  // ================= FRONTEND =================
  tasks.push({
    id: "frontend_1",
    type: "agent",
    role: "frontend",
    agent: "frontend",
    status: "pending",
    dependsOn: ["t0"],
    input: msg
  });

  // ================= BACKEND =================
  tasks.push({
    id: "backend_1",
    type: "agent",
    role: "backend",
    agent: "backend",
    status: "pending",
    dependsOn: ["frontend_1"],
    input: msg
  });

  // ================= CRITIC =================
  tasks.push({
    id: "critic_1",
    type: "agent",
    role: "critic",
    agent: "critic",
    status: "pending",
    dependsOn: [
      "frontend_1",
      "backend_1"
    ],
    input: "Validate generated app"
  });

}

  if (intent === "analysis") {

    tasks.push({
      id: "t3",
      type: "agent",
      role: "analyst",
      status: "pending",
      dependsOn: ["t0"],
      input: msg
    });
  }

if (intent === "research") {

  tasks.push({
    id: "t4",
    type: "agent",
    agent: "research",
    role: "researcher",
    status: "pending",
    dependsOn: ["t0"],
    input: msg
  });

}

  // ================= SYNTHESIS =================
  tasks.push({
    id: "t_final",
    type: "synthesis",
    status: "pending",
    dependsOn: tasks.map(t => t.id)
  });

  return {
    version: "planner-v2",
    intent,
    goal,
    state: "PLANNED",
    risk: reasoning?.risk || "low",
    tasks,
    createdAt: Date.now()
  };
}
