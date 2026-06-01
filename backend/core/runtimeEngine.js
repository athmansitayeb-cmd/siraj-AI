import crypto from "crypto";

import {
  createRuntimeState,
  updateRuntimeState
} from "./runtimeState.js";

import {
  createTaskGraph,
  getReadyTasks,
  completeTask,
  failTask,
  isGraphDone
} from "./taskGraph.js";

import { getTool } from "./toolRegistry.js";
import { selectBestAgent }
  from "./selectBestAgent.js";

import { runAgent }
  from "./agentRouter.js";
import { recordAgentTask }
  from "./agentMemory.js";
import {
  writeWorkspaceFile,
  readWorkspaceFile
} from "./workspaceFs.js";

// ================= EXECUTE TASKS =================
export async function executeTasks(
  tasks = [],
  runtimeContext = {}
) {

  const graph = createTaskGraph(tasks);

const runtimeId =
  crypto.randomUUID();

await createRuntimeState({
  runtimeId,
  workspaceId:
    runtimeContext.workspaceId,
  graph,
  status: "running"
});

  const executionResults = [];

  while (!isGraphDone(graph)) {

    const readyTasks = getReadyTasks(graph);

    // deadlock protection
    if (!readyTasks.length) {
      break;
    }

    await Promise.all(

      readyTasks.map(async task => {

        try {

          // ================= MARK RUNNING =================
          graph.nodes[task.id].status = "running";

          let output = null;

          // ================= TOOL =================
          if (task.type === "tool") {

            const tool = getTool(task.tool);

            if (!tool) {
              throw new Error(
                `Tool not found: ${task.tool}`
              );
            }

            output = await tool.execute(task.input);
          }

// ================= AGENT =================
else if (task.type === "agent") {

const selected = task.agent
  ? { name: task.agent }
  : selectBestAgent(task);

  if (!selected?.name) {
    throw new Error("No agent selected");
  }

  output =
    await runAgent({
      agent: selected.name,
      input: task.input,
      context: {
        role: task.role,
        task,
        workspaceId:
         runtimeContext.workspaceId,
        traceId:
          runtimeContext.traceId
      }
    });

// ================= FILE GENERATION =================
const generatedFiles =
  output?.files ||
  output?.result?.files ||
  [];

if (
  runtimeContext.workspaceId &&
  generatedFiles.length
) {

  for (const file of generatedFiles) {

    await writeWorkspaceFile({
      workspaceId:
        runtimeContext.workspaceId,
      file: file.path,
      content: file.content
    });

  }

}

  recordAgentTask({
    agent: selected.name,
    task: task.input,
    success: true
  });

}

          // ================= REASONING =================
          else if (task.type === "reasoning") {

            output = {
              ok: true,
              result: `Reasoned: ${
                task.input || task.role || ""
              }`
            };
          }

          // ================= SYNTHESIS =================
          else if (task.type === "synthesis") {

            output = {
              ok: true,
              result: "Synthesis completed"
            };
          }

          // ================= UNKNOWN =================
          else {

            output = {
              ok: false,
              result: "Unknown task type"
            };
          }

          // ================= COMPLETE =================
          completeTask(
            graph,
            task.id,
            output
          );

await updateRuntimeState(
  runtimeId,
  {
    graph
  }
);

// ================= SELF HEAL =================
if (
  task.role === "critic" &&
  output?.ok === false
) {

  // ================= FRONTEND RETRY =================
  const retryId =
    `retry_frontend_${Date.now()}`;

  graph.nodes[retryId] = {
    id: retryId,
    type: "agent",
    role: "frontend",
    agent: "frontend",
    status: "pending",
    retries: 0,
    result: null,
    error: null,
    input:
      "Fix frontend problems: " +
      output.problems.join(", ")
  };

  graph.edges[retryId] = [];

  // ================= CRITIC RETRY =================
  const criticRetryId =
    `critic_retry_${Date.now()}`;

  graph.nodes[criticRetryId] = {
    id: criticRetryId,
    type: "agent",
    role: "critic",
    agent: "critic",
    status: "pending",
    retries: 0,
    result: null,
    error: null,
    input:
      "Re-check frontend after fixes"
  };

  graph.edges[criticRetryId] = [
    retryId
  ];

}

if (task.type === "agent") {

  const selected =
    selectBestAgent(task);

  if (selected?.name) {

    recordAgentTask({
      agent: selected.name,
      task: task.input,
      success: false
    });

  }

}

          executionResults.push({
            taskId: task.id,
            status: "done",
            output
          });

        } catch (err) {

          failTask(
            graph,
            task.id,
            err.message || "task_failed"
          );

await updateRuntimeState(
  runtimeId,
  {
    graph
  }
);

          executionResults.push({
            taskId: task.id,
            status: "failed",
            error: err.message
          });

        }

      })

    );

  }

await updateRuntimeState(
  runtimeId,
  {
    status: "completed",
    graph
  }
);
return {
  ok: true,
  runtimeId,
  graph,
  results: executionResults
};
}
