import crypto from "crypto";
import { addTask, updateTask } from "./taskGraph.js";

export async function runtimeReflectionLoop({
  graph,
  criticResult,
  rerunTask,
  updatePlan
}) {

graph.meta.reflectionCount =
(graph.meta.reflectionCount || 0) + 1;

  if (graph.meta.reflectionCount > 3) {
    return {
      ok: false,
      reason: "max_reflection_reached"
    };
  }

  const issues =
    criticResult?.issues ||
    criticResult?.data?.issues ||
    [];

  const criticalIssues =
    issues.filter(i => i.severity === "critical");

  const injected = new Set(
    Object.values(graph.nodes).map(
      n => `${n.agent}:${n.input}`
    )
  );

const lastCritic = Object.values(graph.nodes)
  .filter(n => n.agent === "critic")
  .sort((a, b) => b.createdAt - a.createdAt)[0];

const depends =
  lastCritic ? [lastCritic.id] : [];

const injectedIds = [];

  function inject(agent, input) {

    const key = `${agent}:${input.trim().toLowerCase()}`;

    if (injected.has(key)) return;

    injected.add(key);

const id = crypto.randomUUID();

addTask(graph, {
  id,
  type: "agent",
  agent,
  input,
  dependsOn: depends
});

injectedIds.push(id);

  }

// ================= AUTO REPAIR =================

for (const issue of issues) {

  const agent =
    issue.agent ||
    (issue.type?.includes("frontend")
      ? "frontend"
      : issue.type?.includes("backend")
      ? "backend"
      : "repair");

  const instruction =
    issue.fix ||
    issue.description ||
    issue.message;

  if (!instruction) continue;

  inject(agent, instruction);

}

// إذا كانت المشاكل كثيرة اطلب إعادة التخطيط

if (criticalIssues.length >= 3) {

  await updatePlan({
    improve: true,
    issues,
    criticalCount: criticalIssues.length
  });

}

  // ================= SECOND CRITIC PASS =================

  if (issues.length > 0 && injectedIds.length > 0) {

const repairTasks = injectedIds;

const criticTask = {
  id: crypto.randomUUID(),
  type: "agent",
  agent: "critic",
  input: "review repaired workspace",
  dependsOn: repairTasks
};

const hasPendingCritic = Object.values(graph.nodes).some(
  n =>
    n.agent === "critic" &&
    (n.status === "pending" || n.status === "running")
);

if (!hasPendingCritic) {
    addTask(graph, criticTask);
}

const finalNode = graph.nodes["final_output"];

if (finalNode) {
  updateTask(graph, finalNode.id, {
    dependsOn: [criticTask.id]
  });
}

if (injectedIds.length) {
  await updatePlan({
    improve: true,
    issues,
    criticalCount: criticalIssues.length
  });
}

  }

  return {
    ok: true,
    repaired: criticalIssues.length,
    totalIssues: issues.length,
    hasIssues: issues.length > 0,
    reflectionCount: graph.meta.reflectionCount
  };

}
