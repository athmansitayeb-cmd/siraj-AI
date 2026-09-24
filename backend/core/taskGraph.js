// ================= CREATE GRAPH =================
export function createTaskGraph(tasks = []) {

  const nodes = {};
  const edges = {};

  for (const task of tasks) {

    if (!task?.id) {
      continue;
    }

    if (nodes[task.id]) {
      continue;
    }

    nodes[task.id] = {
      ...task,

      status: "pending",

      retries: 0,

      result: null,

      error: null,

      priority: task.priority ?? 5,

      cost: task.cost ?? 1,

      estimatedTime:
        task.estimatedTime ?? 1,

      maxRetries:
        task.maxRetries ?? 2,

      createdAt: Date.now()
    };

  }

  for (const task of Object.values(nodes)) {

    edges[task.id] =
      Array.isArray(task.dependsOn)
        ? [...new Set(task.dependsOn)]
        : [];

  }

  const graph = {

    nodes,

    edges,

    meta: {

      createdAt: Date.now(),

      updatedAt: Date.now(),

      nodeCount:
        Object.keys(nodes).length,

      reflectionCount: 0,

      repairAttempts: 0

    }

  };

  validateDependencies(graph);

  detectCycles(graph);

  return graph;
}


// ================= READY TASKS =================
export function getReadyTasks(graph) {

  return Object.values(graph.nodes)
    .filter(task => {

      if (task.status !== "pending") {
        return false;
      }

      const deps =
        graph.edges[task.id] || [];

      return deps.every(depId => {

        const dependency =
          graph.nodes[depId];

        return (
          dependency &&
          dependency.status === "done"
        );

      });

    });

}


// ================= BLOCKED TASKS =================
export function failBlockedTasks(graph) {

  let changed = false;

  for (const task of Object.values(graph.nodes)) {

    if (task.status !== "pending") {
      continue;
    }

    const deps =
      graph.edges[task.id] || [];

    // -------------------------------------------------
    // Missing dependency = structural graph failure
    // -------------------------------------------------
    const missingDependency =
      deps.find(depId =>
        !graph.nodes[depId]
      );

    if (missingDependency) {

      task.status = "failed";

      task.error =
        `Missing dependency: ${missingDependency}`;

      task.failedAt = Date.now();

      changed = true;

      console.error(
        "[TASK MISSING DEPENDENCY]",
        task.id,
        "dependency:",
        missingDependency
      );

      continue;
    }

    // -------------------------------------------------
    // Existing dependency failed = blocked task
    // -------------------------------------------------
    const failedDependency =
      deps.find(depId =>
        graph.nodes[depId]?.status === "failed"
      );

    if (!failedDependency) {
      continue;
    }

    task.status = "failed";

    task.error =
      `Blocked by failed dependency: ${failedDependency}`;

    task.failedAt = Date.now();

    changed = true;

    console.warn(
      "[TASK BLOCKED]",
      task.id,
      "dependency:",
      failedDependency
    );

  }

  return changed;
}


// ================= COMPLETE =================
export function completeTask(
  graph,
  id,
  result
) {

  const node =
    graph.nodes[id];

  if (!node) {
    return false;
  }

  node.status = "done";

  node.result = result;

  node.error = null;

  node.completedAt = Date.now();

  graph.meta.updatedAt =
    Date.now();

  return true;
}


// ================= FAIL =================
export function failTask(
  graph,
  id,
  error
) {

  const node =
    graph.nodes[id];

  if (!node) {
    return false;
  }

  node.retries =
    (node.retries || 0) + 1;

  node.error = error;

  node.lastFailedAt =
    Date.now();

  const maxRetries =
    node.maxRetries ?? 2;

  if (node.retries >= maxRetries) {

    node.status = "failed";
    node.retryAt = null;

  } else {

    node.status = "pending";

    // Exponential retry backoff:
    // 1s, 2s, 4s, ... capped at 8s.
    const retryDelayMs =
      Math.min(
        1000 * (2 ** (node.retries - 1)),
        8000
      );

    node.retryAt =
      Date.now() + retryDelayMs;

  }

  graph.meta.updatedAt =
    Date.now();

  return true;
}


// ================= DONE CHECK =================
export function isGraphDone(graph) {

  const nodes =
    Object.values(graph.nodes);

  if (!nodes.length) {
    return true;
  }

  return nodes.every(node =>
    node.status === "done" ||
    node.status === "failed"
  );

}


// ================= CYCLE DETECTION =================
function detectCycles(graph) {

  const visited = new Set();

  const stack = new Set();

  function visit(nodeId) {

    if (stack.has(nodeId)) {

      throw new Error(
        `Cycle detected at ${nodeId}`
      );

    }

    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);

    stack.add(nodeId);

    const deps =
      graph.edges[nodeId] || [];

    for (const dep of deps) {

      if (!graph.nodes[dep]) {
        continue;
      }

      visit(dep);

    }

    stack.delete(nodeId);

  }

  for (const id of Object.keys(graph.nodes)) {

    visit(id);

  }

}


// ================= DEPENDENCY VALIDATION =================
function validateDependencies(graph) {

  const missing = [];

  for (const [taskId, deps] of Object.entries(graph.edges)) {

    for (const dep of deps) {

      if (!graph.nodes[dep]) {

        missing.push({
          taskId,
          dependency: dep
        });

      }

    }

  }

  if (missing.length) {

    console.warn(
      "[GRAPH MISSING DEPENDENCIES]",
      missing
    );

  }

  return missing;
}


// ================= ADD TASK =================
export function addTask(
  graph,
  task
) {

  if (!task?.id) {
    return false;
  }

  if (graph.nodes[task.id]) {
    return false;
  }

  const duplicate =
    Object.values(graph.nodes).find(node =>
      node.agent === task.agent &&
      node.type === task.type &&
      node.input === task.input
    );

  if (duplicate) {
    return false;
  }

  const dependsOn =
    Array.isArray(task.dependsOn)
      ? [...new Set(task.dependsOn)]
      : [];

  graph.nodes[task.id] = {

    ...task,

    status: "pending",

    retries: 0,

    result: null,

    error: null,

    priority:
      task.priority ?? 5,

    cost:
      task.cost ?? 1,

    estimatedTime:
      task.estimatedTime ?? 1,

    maxRetries:
      task.maxRetries ?? 2,

    createdAt: Date.now()

  };

  /*
   * لا نحذف dependencies غير الموجودة.
   *
   * هذا مهم لأن planner قد يضيف عدة tasks
   * في نفس الدفعة، وقد تعتمد مهمة على مهمة
   * سيتم إدخالها بعد لحظات.
   */
  graph.edges[task.id] =
    dependsOn;

  detectCycles(graph);

  graph.meta.updatedAt =
    Date.now();

  graph.meta.nodeCount =
    Object.keys(graph.nodes).length;

  return true;
}


// ================= ADD TASKS =================
export function addTasks(
  graph,
  tasks = []
) {

  const added = [];

  for (const task of tasks) {

    if (addTask(graph, task)) {

      added.push(task.id);

    }

  }

  validateDependencies(graph);

  detectCycles(graph);

  return added;
}


// ================= REMOVE TASK =================
export function removeTask(
  graph,
  taskId
) {

  if (!graph.nodes[taskId]) {
    return false;
  }

  delete graph.nodes[taskId];

  delete graph.edges[taskId];

  for (const id of Object.keys(graph.edges)) {

    graph.edges[id] =
      graph.edges[id].filter(
        dep => dep !== taskId
      );

  }

  graph.meta.updatedAt =
    Date.now();

  graph.meta.nodeCount =
    Object.keys(graph.nodes).length;

  return true;
}


// ================= UPDATE TASK =================
export function updateTask(
  graph,
  taskId,
  patch = {}
) {

  if (!graph.nodes[taskId]) {
    return false;
  }

  const previous =
    graph.nodes[taskId];

  const next = {
    ...previous,
    ...patch
  };

  if (
    patch.dependsOn !== undefined
  ) {

    if (!Array.isArray(patch.dependsOn)) {

      throw new Error(
        "dependsOn must be an array"
      );

    }

    next.dependsOn =
      [...new Set(patch.dependsOn)];

  }

  graph.nodes[taskId] =
    next;

  if (
    patch.dependsOn !== undefined
  ) {

    graph.edges[taskId] =
      [...new Set(patch.dependsOn)];

    detectCycles(graph);

    validateDependencies(graph);

  }

  graph.meta.updatedAt =
    Date.now();

  return true;
}


// ================= RESET TASK =================
export function resetTask(
  graph,
  taskId
) {

  const node =
    graph.nodes[taskId];

  if (!node) {
    return false;
  }

  node.status = "pending";

  node.result = null;

  node.error = null;

  node.failedAt = null;

  node.completedAt = null;

  node.lastFailedAt = null;

  graph.meta.updatedAt =
    Date.now();

  return true;
}
