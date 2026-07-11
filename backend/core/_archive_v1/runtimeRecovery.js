import {
  getRuntimeState,
  updateRuntimeState
} from "./runtimeState.js";

import {
  getReadyTasks,
  isGraphDone
} from "./taskGraph.js";

// ================= RECOVER =================
export async function recoverRuntime(
  runtimeId
) {

  const runtime =
    await getRuntimeState(runtimeId);

  if (!runtime) {
    return null;
  }

  const graph = runtime.graph;

  // ================= RESET RUNNING TASKS =================
  for (const nodeId in graph.nodes) {

    const node = graph.nodes[nodeId];

    if (node.status === "running") {
      node.status = "pending";
    }
  }

  // ================= UPDATE =================
  await updateRuntimeState(runtimeId, {
    graph,
    status: "recovered"
  });

  return {
    runtimeId,
    readyTasks:
      getReadyTasks(graph),
    done:
      isGraphDone(graph),
    graph
  };
}
