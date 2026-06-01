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
      createdAt: Date.now()
    };

    edges[task.id] = task.dependsOn || [];
  }

  const graph = {
    nodes,
    edges,
    meta: {
      createdAt: Date.now()
    }
  };

  detectCycles(graph); // 🔥 مهم

  return graph;
}

// ================= READY TASKS =================
export function getReadyTasks(graph) {

  return Object.values(graph.nodes).filter(task => {

    if (task.status !== "pending") return false;

    const deps = graph.edges[task.id] || [];

    return deps.every(depId =>
      graph.nodes[depId]?.status === "done"
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

  return Object.values(graph.nodes)
    .every(n => n.status === "done" || n.status === "failed");
}

// ================= CYCLE DETECTION =================
function detectCycles(graph) {

  const visited = new Set();
  const stack = new Set();

  function visit(nodeId) {

    if (stack.has(nodeId)) {
      throw new Error(`Cycle detected at ${nodeId}`);
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    stack.add(nodeId);

    const deps = graph.edges[nodeId] || [];

    for (const dep of deps) {
      visit(dep);
    }

    stack.delete(nodeId);
  }

  for (const id of Object.keys(graph.nodes)) {
    visit(id);
  }
}
