import { getAccess } from "./accessControl.js";
import { getUserPlan } from "./entitlements.js";
import { buildPaywall } from "./paywall.js";
import { getUserMemory } from "./userMemory.js";
import { updateFeedback } from "./feedbackLoop.js";
import { bootstrapCore } from "./bootstrap.js";
import { executeTasks } from "./runtimeEngine.js";
import Workspace from "../models/Workspace.js";
import crypto from "crypto";
import { buildSirajCore } from "./sirajCore.js";
import { unifiedPlanner } from "./unifiedPlanner.js";
import { getAgent } from "./agentRegistry.js";
import { listWorkspaceFiles } from "./workspaceFs.js";
import { readKnowledge } from "./sharedWorkspaceBus.js";
import { getWorkspaceMemory } from "./workspaceMemory.js";

function compactOutput(data = {}) {

  return {
    ok: data.ok,

    runtimeId: data.runtimeId,

    files: (data.files || []).map(file => ({
      path: file.path,
      size: file.content?.length || 0
    })),

    summary: data.summary,

    critic: data.critic
      ? {
          verdict: data.critic.verdict,
          repair: data.critic.repair,
          issues: data.critic.summary
        }
      : null,

    graph: data.graph
      ? {
          nodes: Object.keys(data.graph.nodes || {}).length,
          reflections: data.graph.reflectionCount || 0
        }
      : null
  };

}

export async function orchestrate({
convo,
msg,
userId,
redis,
context = {}
}) {
console.log("===== ORCHESTRATOR START =====");
try {

await bootstrapCore();

if (!msg || typeof msg !== "string") {
  return { ok: false, reason: "invalid_input" };
}

if (msg.length < 2) {
  return { ok: false, reason: "too_short" };
}

if (msg.length > 800) {
  return buildPaywall("message_too_long", {
    limit: 800
  });
}

const isGuest =
  userId?.startsWith("guest_");

let planRaw = "free";

try {
  planRaw = isGuest
    ? "free"
    : await getUserPlan(userId, redis);
} catch {}

const userPlan = ["free", "pro", "guest"].includes(planRaw)
  ? planRaw
  : "free";

getAccess(userPlan);

const cacheKey = `ai:${userId}:${crypto
  .createHash("sha256")
  .update(msg + userPlan)
  .digest("hex")}`;

if (redis) {
  const cached = await redis.get(cacheKey);

  if (cached) {
    return {
      ok: true,
      text: cached,
      cached: true
    };
  }
}

let workspace = null;

if (context?.workspaceId) {
  workspace =
    await Workspace.findById(
      context.workspaceId
    ).lean();
}

let workspaceFiles = [];
let workspaceKnowledge = [];
let workspaceMemory = {};

if (context?.workspaceId) {

  workspaceFiles =
    await listWorkspaceFiles(
      context.workspaceId
    );

  workspaceKnowledge =
    await readKnowledge(
      context.workspaceId,
      workspace?.version || 1
    );

  workspaceMemory =
    await getWorkspaceMemory(
      context.workspaceId,
      workspace?.version || 1
    );

}

const userMemory =
  await getUserMemory(userId);

const cognition = buildSirajCore({
  convo,
  msg,
  memory: userMemory,
  reasoning: {},
  focus: context?.focus || null
});

const initialPlan = unifiedPlanner({
  msg,
  cognition
});

console.log("[INITIAL PLAN]", {
  intent: initialPlan?.intent,
  complexity: initialPlan?.complexity,
  taskCount: Array.isArray(initialPlan?.tasks)
    ? initialPlan.tasks.length
    : 0
});

if (initialPlan.intent === "conversation") {

  const assistant = getAgent("assistant");

  const res = await assistant.execute({
    input: {
      original: msg
    },
    context: {
      systemPrompt: cognition.systemPrompt
    }
  });

  return {
    ok: true,
    text: res.text,
    output: res
  };
}

let tasks = initialPlan.tasks;
let plannerOutput = {};

// Execute planner whenever it is the first task
if (
  tasks.length > 0 &&
  tasks[0]?.agent === "planner"
) {

  const planner = await executeTasks(
    [tasks[0]],
{
  workspaceId: context.workspaceId,

  workspace: {
    snapshot: workspace,
    files: workspaceFiles,
    knowledge: workspaceKnowledge,
    memory: workspaceMemory
  },

  traceId: context.traceId,

  intent: cognition.intent,
  state: cognition.state,
  mode: cognition.mode,

  systemPrompt: cognition.systemPrompt,
  originalPrompt: msg
}
  );

plannerOutput =
  planner.results?.[0]?.output || {};

console.log("[PLANNER OUTPUT]", {
  ok: plannerOutput?.ok,
  intent: plannerOutput?.intent,
  taskCount: Array.isArray(plannerOutput?.tasks)
    ? plannerOutput.tasks.length
    : Array.isArray(plannerOutput?.data?.tasks)
      ? plannerOutput.data.tasks.length
      : 0
});

const plannerTasks =
  plannerOutput.tasks ||
  plannerOutput.data?.tasks ||
  [];

if (!plannerOutput.ok) {
  return {
    ok: false,
    reason: plannerOutput.error || "planner_failed"
  };
}

if (plannerTasks.length) {
  tasks = plannerTasks;

context.planner = plannerOutput;
}

console.log(
  "[PLANNER TASKS]",
  tasks.map(t => ({
    id: t.id,
    agent: t.agent,
    type: t.type,
    dependsOn: t.dependsOn
  }))
);

}


console.log("[ORCHESTRATOR] BEFORE EXECUTE TASKS", {
  taskCount: tasks.length,
  tasks: tasks.map(t => ({
    id: t.id,
    agent: t.agent,
    type: t.type,
    dependsOn: t.dependsOn
  })),
  workspaceId: context.workspaceId
});

const result = await executeTasks(
  tasks,
  {
    workspaceId: context.workspaceId,

    planner: plannerOutput,

    workspace: {
      snapshot: workspace,
      files: workspaceFiles,
      knowledge: workspaceKnowledge,
      memory: workspaceMemory
    },

    traceId: context.traceId,

    intent: cognition.intent,
    state: cognition.state,
    mode: cognition.mode,

    systemPrompt: cognition.systemPrompt,
    originalPrompt: msg
  }
);

console.log("[ORCHESTRATOR] AFTER EXECUTE TASKS", {
  ok: result?.ok,
  error: result?.error,
  resultCount: result?.results?.length
});

console.log(
  "[EXECUTE TASKS RESULT]",
  JSON.stringify(compactOutput(result), null, 2)
);

// لا نعتبر التنفيذ ناجحاً إذا كانت هناك مهام فاشلة
// أو إذا توقف الـ runtime قبل إنهاء الـ graph.
if (
  !result ||
  result.ok !== true ||
  result.summary?.failed > 0 ||
  (
    Number.isFinite(result.summary?.totalTasks) &&
    Number.isFinite(result.summary?.success) &&
    result.summary.totalTasks > result.summary.success
  )
) {
  console.error(
    "[ORCHESTRATOR] Execution incomplete",
    JSON.stringify(compactOutput(result), null, 2)
  );

  return finalize(
    {
      ok: false,
      reason: "execution_incomplete",
      files: result?.files || [],
      graph: result?.graph,
      summary: result?.summary,
      critic: result?.critic || null,
      runtimeId: result?.runtimeId
    },
    userMemory,
    msg,
    redis,
    cacheKey
  );
}

let finalOutput = {
  ok: result.ok,

  files: result.files || [],

  graph: result.graph,

  summary: result.summary,

  critic: result.critic,

  runtimeId: result.runtimeId
};

try {
  if (typeof finalOutput === "string") {
    finalOutput = JSON.parse(finalOutput);
  }
} catch {}

console.log(
  "[FINAL OUTPUT]",
  JSON.stringify(compactOutput(finalOutput), null, 2)
);

return finalize(
  finalOutput,
  userMemory,
  msg,
  redis,
  cacheKey
);

} catch (e) {

console.error(
  "[ORCHESTRATOR ERROR]",
  e
);

return {
  ok: false,
  reason: "internal_error"
};

}
}

async function finalize(
output,
memory,
msg,
redis,
cacheKey
) {

await updateFeedback(
memory,
msg,
output
);

const text =
JSON.stringify(output, null, 2);

if (redis) {
await redis.setEx(
cacheKey,
600,
text
);
}

return {
  ok: output.ok,
  output,
  text
};
}
