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

export async function orchestrate({
convo,
msg,
userId,
redis,
context = {}
}) {

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

let tasks = initialPlan.tasks;

// Execute planner whenever it is the first task
if (
  tasks.length > 0 &&
  tasks[0]?.agent === "planner"
) {

  const planner = await executeTasks(
    [tasks[0]],
    {
      workspaceId: context.workspaceId,workspace,
      traceId: context.traceId,

      intent: cognition.intent,
      state: cognition.state,
      mode: cognition.mode,

      systemPrompt: cognition.systemPrompt,
      originalPrompt: msg
    }
  );

const plannerOutput =
  planner.results?.[0]?.output || {};

console.log(
  "[PLANNER OUTPUT]",
  JSON.stringify(plannerOutput, null, 2)
);

const plannerTasks =
  plannerOutput.tasks ||
  plannerOutput.data?.tasks ||
  [];

if (plannerTasks.length) {
  tasks = plannerTasks;
}

console.log(
  "[PLANNER TASKS]",
  JSON.stringify(tasks, null, 2)
);
}

const result = await executeTasks(
  tasks,
  {
    workspaceId: context.workspaceId,workspace,
    traceId: context.traceId,

    intent: cognition.intent,
    state: cognition.state,
    mode: cognition.mode,

    systemPrompt: cognition.systemPrompt,
    originalPrompt: msg
  }
);

console.log(
  "[EXECUTE TASKS RESULT]",
  JSON.stringify(result, null, 2)
);

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

console.log("[FINAL OUTPUT]", finalOutput);

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
  ok: true,
  output,
  text
};

}
