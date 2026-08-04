// ================= CREATE GRAPH =================
export function createTaskGraph(tasks = []) {

  const nodes = {};
  const edges = {};

for (const task of tasks) {

  nodes[task.id] = {
    ...task,
    status: "pending",
    retries: 0,
    result: null,
    error: null,

    priority: task.priority ?? 5,
    cost: task.cost ?? 1,
    estimatedTime: task.estimatedTime ?? 1,

    createdAt: Date.now()
  };

}

for (const task of tasks) {

  edges[task.id] = (task.dependsOn || [])
    .filter(dep => dep in nodes);

}

  const graph = {
    nodes,
    edges,
    meta: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      nodeCount: Object.keys(nodes).length,
      reflectionCount: 0
    }
  };

  detectCycles(graph);

  return graph;
}

// ================= READY TASKS =================
export function getReadyTasks(graph) {

  return Object.values(graph.nodes).filter(task => {

    if (task.status !== "pending") {
      return false;
    }

    const deps = graph.edges[task.id] || [];

    return deps.every(depId =>
      graph.nodes[depId] &&
      graph.nodes[depId].status === "done"
    );

  });

}

// ================= COMPLETE =================
export function completeTask(graph, id, result) {

  if (!graph.nodes[id]) return;

  graph.nodes[id].status = "done";
  graph.nodes[id].result = result;
  graph.nodes[id].completedAt = Date.now();

}

// ================= FAIL =================
export function failTask(graph, id, error) {

  const node = graph.nodes[id];

  if (!node) return;

  node.retries++;

  if (node.retries >= (node.maxRetries || 2)) {
    node.status = "failed";
  } else {
    node.status = "pending";
  }

  node.error = error;
  node.lastFailedAt = Date.now();

}

// ================= DONE CHECK =================
export function isGraphDone(graph) {

  const nodes = Object.values(graph.nodes);

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
      throw new Error(`Cycle detected at ${nodeId}`);
    }

    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    stack.add(nodeId);

    const deps = graph.edges[nodeId] || [];

    for (const dep of deps) {

      if (graph.nodes[dep]) {
        visit(dep);
      }

    }

    stack.delete(nodeId);

  }

  for (const id of Object.keys(graph.nodes)) {
    visit(id);
  }

}

// ================= ADD TASK =================
export function addTask(graph, task) {

  if (graph.nodes[task.id]) {
    return false;
  }

  const duplicate = Object.values(graph.nodes).find(node =>
    node.agent === task.agent &&
    node.type === task.type &&
    node.input === task.input
  );

  if (duplicate) {
    return false;
  }

graph.nodes[task.id] = {
  ...task,
  status: "pending",
  retries: 0,
  result: null,
  error: null,

  priority: task.priority ?? 5,
  cost: task.cost ?? 1,
  estimatedTime: task.estimatedTime ?? 1,

  createdAt: Date.now()
};

graph.edges[task.id] = (task.dependsOn || [])
  .filter(dep => dep in graph.nodes);

  detectCycles(graph);

  graph.meta.updatedAt = Date.now();
  graph.meta.nodeCount = Object.keys(graph.nodes).length;

  return true;

}

// ================= REMOVE TASK =================
export function removeTask(graph, taskId) {

  delete graph.nodes[taskId];
  delete graph.edges[taskId];

  for (const id of Object.keys(graph.edges)) {

    graph.edges[id] =
      graph.edges[id].filter(dep => dep !== taskId);

  }

  graph.meta.updatedAt = Date.now();
  graph.meta.nodeCount = Object.keys(graph.nodes).length;

}

// ================= UPDATE TASK =================
export function updateTask(graph, taskId, patch = {}) {

  if (!graph.nodes[taskId]) {
    return false;
  }

  graph.nodes[taskId] = {
    ...graph.nodes[taskId],
    ...patch
  };

  if (patch.dependsOn) {

    graph.edges[taskId] = patch.dependsOn;

    detectCycles(graph);

  }

  graph.meta.updatedAt = Date.now();

  return true;

}
