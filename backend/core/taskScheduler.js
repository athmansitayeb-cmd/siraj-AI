// ================= TASK SCHEDULER =================

function score(task, graph) {

  let priority = task.priority ?? 0;

if (task.retries > 0) {
  priority += 20;
}

  // planner أولاً
  if (task.agent === "planner")
    priority += 100;

  // critic قرب النهاية
if (
  task.agent === "critic" &&
  (task.dependsOn?.length || 0) === 0
) {
  priority += 80;
}

const age =
  (Date.now() - (task.createdAt || Date.now())) / 1000;

priority += Math.min(age, 30);

  // synthesis آخر شيء
  if (task.type === "synthesis")
    priority -= 100;

  // المهام التي يعتمد عليها الآخرون
const children = Object.values(graph.edges)
  .filter(deps => deps.includes(task.id))
  .length;

  priority += children * 10;

  // تكلفة التنفيذ
  priority -= task.cost || 0;

  return priority;
}

export function scheduleTasks(
  readyTasks,
  graph,
  runtimeContext = {}
) {

const maxParallel = Math.min(
  runtimeContext.maxParallel || 4,
  readyTasks.length
);

const plannerTask = readyTasks.find(
  t => t.agent === "planner"
);

if (plannerTask) {
  return [plannerTask];
}

// Verification critic must run only after repair tasks.
// It is identified by its verification instruction.
const verificationCritic = readyTasks.find(
  t =>
    t.agent === "critic" &&
    String(t.input || "")
      .toLowerCase()
      .includes("verify whether the reported issues are completely resolved")
);

if (verificationCritic) {

  const repairTasks =
    Object.values(graph.nodes).filter(
      node =>
        node.id !== verificationCritic.id &&
        (
          node.agent === "repair" ||
          node.agent === "frontend" ||
          node.agent === "backend" ||
          node.agent === "architect"
        ) &&
        (
          node.status === "pending" ||
          node.status === "running"
        )
    );

  if (repairTasks.length) {
    return [];
  }

  return [verificationCritic];
}

  return [...readyTasks]
    .sort((a, b) => score(b, graph) - score(a, graph))
    .slice(0, maxParallel);

}
