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
  isGraphDone,
  addTask
} from "./taskGraph.js";

import { getTool } from "./toolRegistry.js";
import { selectBestAgent } from "./selectBestAgent.js";
import { runAgent } from "./agentRouter.js";
import { writeWorkspaceFile } from "./workspaceFs.js";
import { normalizeOutput } from "./utils/normalizeOutput.js";
import { shouldUseLLM } from "./llmGate.js";
import { getAgent } from "./agentRegistry.js";
import { runtimeReflectionLoop } from "./runtimeReflectionLoop.js";

// ================= GLOBAL EXECUTION CACHE =================
const executionCache = new Map();

// ================= HASH TASK =================
function hashTask(task, context) {
  return crypto
    .createHash("md5")
    .update(JSON.stringify({
      task,
      workspaceId: context.workspaceId
    }))
    .digest("hex");
}
// ================= PRE EXECUTION DECISION =================
function shouldSkipExecution(task) {

  if (task.type === "synthesis") {
    return false;
  }

  const input = task?.input || "";

  if (!input) return true;

  if (
    task.type === "reasoning" &&
    String(input).length < 5
  ) {
    return true;
  }

  return false;
}

// ================= EXECUTION ENGINE =================
export async function executeTasks(tasks = [], runtimeContext = {}) {

  const graph = createTaskGraph(tasks);
  const runtimeId = crypto.randomUUID();

  await createRuntimeState({
    runtimeId,
    workspaceId: runtimeContext.workspaceId,
    graph,
    status: "running"
  });

  const results = [];

  while (!isGraphDone(graph)) {

    const readyTasks = getReadyTasks(graph);
    if (!readyTasks.length) break;

    await Promise.all(
      readyTasks.map(async (task) => {

        try {

          // ================= CACHE CHECK =================
          const cacheKey = hashTask(task, runtimeContext);

          if (executionCache.has(cacheKey)) {
            const cached = executionCache.get(cacheKey);

            completeTask(graph, task.id, cached);

            results.push({
              taskId: task.id,
              status: "cached",
              output: cached
            });

            return;
          }

          // ================= PRE CHECK =================
          if (shouldSkipExecution(task)) {
            const skipOutput = {
              ok: true,
              skipped: true,
              result: "skipped_task"
            };

            completeTask(graph, task.id, skipOutput);

            return;
          }

          graph.nodes[task.id].status = "running";

          let output;

          // ================= TOOL EXECUTION =================
          if (task.type === "tool") {

            const tool = getTool(task.tool);
            if (!tool) throw new Error(`Tool not found: ${task.tool}`);

            output = await tool.execute(task.input);
          }

          // ================= AGENT EXECUTION =================
          else if (task.type === "agent") {

            const selected = task.agent
              ? { name: task.agent }
              : await selectBestAgent({
                  input: task.input,
                  intent: runtimeContext.intent,
                  hint: task.hint
                });

            if (!selected?.name) {
              throw new Error("No agent selected");
            }

            const dependencyResults =
              (task.dependsOn || []).map(depId => ({
                id: depId,
                result: graph.nodes[depId]?.result
              }));

            // ================= LLM GATE =================
function shouldForceLLM(task, context) {

  const input = task?.input || "";

  // critical reasoning tasks
  if (task.type === "synthesis") return true;

  if (input.includes("fix") || input.includes("error")) return true;

  if ((task.dependsOn || []).length > 1) return true;

  return false;
}

let useLLM = shouldUseLLM(selected.name, {
  task,
  input: task.input
});

if (shouldForceLLM(task, runtimeContext)) {
  useLLM = true;
}

            let res;

            if (!useLLM) {

              // deterministic execution path (NO LLM)
              const agent = (await import("./agentRegistry.js"))
                .getAgent(selected.name);

              res = await agent.execute({
input: {
  original: runtimeContext.originalPrompt || task.input,
  instruction: task.input,
  dependencies: dependencyResults
},
context: {
  role: task.role,
  task,

  workspaceId: runtimeContext.workspaceId,
  traceId: runtimeContext.traceId,

  intent: runtimeContext.intent,
  state: runtimeContext.state,
  mode: runtimeContext.mode,

  systemPrompt: runtimeContext.systemPrompt,

  originalPrompt: runtimeContext.originalPrompt
}
              });

if (selected.name === "planner") {

  const plan = res;

  if (plan?.tasks && Array.isArray(plan.tasks)) {

for (const t of plan.tasks) {

  addTask(graph, t);

}

console.log(
  "[GRAPH AFTER PLANNER]",
  JSON.stringify(graph, null, 2)
);

  }
}

            } else {

              // LLM execution path
              res = await runAgent({
                agent: selected.name,
input: {
  original: runtimeContext.originalPrompt || task.input,
  instruction: task.input,
  dependencies: dependencyResults
},
context: {
  role: task.role,
  task,

  workspaceId: runtimeContext.workspaceId,
  traceId: runtimeContext.traceId,

  intent: runtimeContext.intent,
  state: runtimeContext.state,
  mode: runtimeContext.mode,

  systemPrompt: runtimeContext.systemPrompt,

  originalPrompt: runtimeContext.originalPrompt
}
              });
            }

            output = normalizeOutput(res);

            // ================= CACHE STORE =================
            executionCache.set(cacheKey, output);

            // ================= FILE OUTPUT =================
            const files =
              output?.files ||
              output?.result?.files ||
              [];

            if (runtimeContext.workspaceId && files.length) {
              for (const file of files) {
                await writeWorkspaceFile({
                  workspaceId: runtimeContext.workspaceId,
                  file: file.path,
                  content: file.content
                });
              }
            }
          }

          // ================= SYNTHESIS =================
else if (task.type === "synthesis") {

  const nodes = Object.values(graph.nodes);

  const files = nodes
    .flatMap(n => n.result?.files || []);

  const data = {
    merged: nodes.map(n => ({
      task: n.id,
      status: n.status,
      output: n.result
    })),

    summary: {
      totalTasks: nodes.length,
      success: nodes.filter(n => n.status === "done").length,
      failed: nodes.filter(n => n.status === "failed").length
    }
  };

  output = {
    ok: true,
    data: {
      files,
      data
    },
    files: []
  };
}


          else {
            output = { ok: false, result: "unknown task type" };
          }

          completeTask(graph, task.id, output);

          await updateRuntimeState(runtimeId, { graph });

          results.push({
            taskId: task.id,
            status: "done",
            output
          });

        } catch (err) {

          failTask(graph, task.id, err.message || "task_failed");

          await updateRuntimeState(runtimeId, { graph });

          results.push({
            taskId: task.id,
            status: "failed",
            error: err.message
          });
        }

      })
    );
  }

  await updateRuntimeState(runtimeId, {
    status: "completed",
    graph
  });

// ================= CRITIC REPAIR PATCH =================
const critic = results.find(r => {
  const node = graph.nodes[r.taskId];
  return node?.agent === "critic";
});

if (critic?.output?.data?.repair) {

  const issues = critic.output.data.issues || [];

  for (const issue of issues) {

    if (issue.type === "missing_frontend_login") {

      if (graph.nodes["frontend_1"]) {
        graph.nodes["frontend_1"].input =
          "create Login.jsx with React hooks + validation";
      }
    }

    if (issue.type === "missing_backend_server") {

      if (graph.nodes["backend_1"]) {
        graph.nodes["backend_1"].input =
          "create production Express server with auth routes";
      }
    }

    if (issue.meta?.route) {

      const backendNode = graph.nodes["backend_1"];

      if (backendNode) {
        backendNode.input +=
          `\nensure route ${issue.meta.route}`;
      }
    }
  }
}

if (critic?.output) {

  await runtimeReflectionLoop({
    graph,
    criticResult: critic.output,

rerunTask: async () => {
  // Reflection adds tasks directly to graph.
  return true;
},
    updatePlan: async () => {}
  });

}

const finalFiles = Object.values(graph.nodes)
  .flatMap(n => n.result?.files || []);

return {
  ok: true,
  runtimeId,
  graph,
  results,
  files: finalFiles,
  critic: critic?.output?.data,
  summary: {
    totalTasks: Object.keys(graph.nodes).length,
    success: Object.values(graph.nodes)
      .filter(n => n.status === "done").length,
    failed: Object.values(graph.nodes)
      .filter(n => n.status === "failed").length
  }
};
}
