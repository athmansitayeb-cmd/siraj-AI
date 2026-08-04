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
import { runAgent } from "./agentRouter.js";
import { writeWorkspaceFile } from "./workspaceFs.js";
import { normalizeOutput } from "./utils/normalizeOutput.js";
import { shouldUseLLM } from "./llmGate.js";
import { getAgent } from "./agentRegistry.js";
import { runtimeReflectionLoop } from "./runtimeReflectionLoop.js";
import { publishKnowledge } from "./sharedWorkspaceBus.js";
import { scheduleTasks } from "./taskScheduler.js";

// ================= GLOBAL EXECUTION CACHE =================
const executionCache = new Map();

// ================= HASH TASK =================
function compactOutput(data = {}) {
  return {
    ...data,

    files: (data.files || []).map(file => ({
      path: file.path,
      size: file.content
        ? Buffer.byteLength(file.content, "utf8")
        : 0
    }))
  };
}

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

// ================= AUTO INSERT CRITIC =================
const hasCritic = tasks.some(
  t => t.agent === "critic"
);

const hasFinal = tasks.some(
  t => t.type === "synthesis"
);

// هل توجد مهام توليد مشروع؟
const hasBuildAgents = tasks.some(t =>
  t.type === "agent" &&
  [
    "planner",
    "frontend",
    "backend",
    "architect",
    "repair"
  ].includes(t.agent)
);

if (!hasCritic && hasFinal && hasBuildAgents) {

  const finalTask = tasks.find(
    t => t.type === "synthesis"
  );

  const deps = finalTask?.dependsOn || [];

  tasks.push({
    id: "critic_1",
    type: "agent",
    agent: "critic",
    input: "Review generated workspace",
    dependsOn: deps
  });

  finalTask.dependsOn = ["critic_1"];
}

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

    const readyTasks = scheduleTasks(
      getReadyTasks(graph),
      graph,
      runtimeContext
    );
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

if (!task.agent) {
  throw new Error("Task has no assigned agent");
}

const selected = getAgent(task.agent);

if (!selected) {
    throw new Error(`Agent '${task.agent}' not found`);
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

  dependencies: dependencyResults,

  previousResults: results,

  graph: graph
},
context: {
  role: task.role,
  task,

  planner: runtimeContext.planner,

  workspaceId: runtimeContext.workspaceId,

  workspace: runtimeContext.workspace,

  runtimeGraph: graph,

  previousResults: results,

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

  dependencies: dependencyResults,

  previousResults: results,

  graph: graph
},
context: {
  role: task.role,
  task,

  planner: runtimeContext.planner,

  workspaceId: runtimeContext.workspaceId,

  workspace: runtimeContext.workspace,

  runtimeGraph: graph,

  previousResults: results,

  traceId: runtimeContext.traceId,

  intent: runtimeContext.intent,
  state: runtimeContext.state,
  mode: runtimeContext.mode,

  systemPrompt: runtimeContext.systemPrompt,

  originalPrompt: runtimeContext.originalPrompt
}
              });
            }

console.log(
  `[RAW ${selected.name.toUpperCase()} RESULT]`,
  JSON.stringify(compactOutput(res), null, 2)
);

            output = normalizeOutput(res);

console.log(
  `[NORMALIZED ${selected.name.toUpperCase()} RESULT]`,
  JSON.stringify(compactOutput(output), null, 2)
);

            // ================= CACHE STORE =================
if (output?.ok) {
  executionCache.set(cacheKey, output);
}
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

if (
  runtimeContext.workspaceId &&
  (
    output.pages ||
    output.routes ||
    output.entities ||
    output.architecture
  )
) {
  await publishKnowledge(
    runtimeContext.workspaceId,
    selected.name,
    {
      pages: output.pages || [],
      routes: output.routes || [],
      entities: output.entities || [],
      architecture: output.architecture || {}
    }
  );
}
          }

          // ================= SYNTHESIS =================
else if (task.type === "synthesis") {

  const nodes = Object.values(graph.nodes)
    .filter(n => n.id !== task.id);

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

if (output?.ok === false) {

  failTask(
    graph,
    task.id,
    output.error || "agent_failed"
  );

console.log("[TASK FAILED]", task.id, output.error);

  await updateRuntimeState(runtimeId, { graph });

  results.push({
    taskId: task.id,
    status: "failed",
    error: output.error,
    output
  });

  return;
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

if (critic?.output) {

await runtimeReflectionLoop({
    graph,
    criticResult: critic.output,

    rerunTask: async () => true,

    updatePlan: async (patch) => {

        const planner = getAgent("planner");

        if (!planner) return;

        const repairedPlan =
            await planner.execute({

                input: {
                    original: runtimeContext.originalPrompt,
                    instruction:
                        "Repair execution graph",
                    critic: critic.output.data,
                    graph
                },

                context: runtimeContext

            });

        if (repairedPlan?.tasks) {

            for (const task of repairedPlan.tasks) {
                addTask(graph, task);
            }

        }

    }

});

}

if (!isGraphDone(graph)) {
  console.warn("[RUNTIME] Graph stopped with unfinished tasks.");
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
