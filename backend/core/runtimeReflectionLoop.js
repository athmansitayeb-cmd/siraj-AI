import crypto from "crypto";
import {
  addTask,
  updateTask,
  resetTask
} from "./taskGraph.js";

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
      reason: "max_reflection_reached",
      repaired: 0,
      totalIssues: 0,
      hasIssues: false
    };
  }

  const issues =
    criticResult?.issues ||
    criticResult?.data?.issues ||
    [];

  if (!Array.isArray(issues) || !issues.length) {
    return {
      ok: true,
      repaired: 0,
      totalIssues: 0,
      hasIssues: false,
      reflectionCount:
        graph.meta.reflectionCount
    };
  }

  const criticalIssues =
    issues.filter(
      issue =>
        issue?.severity === "critical"
    );

  // ----------------------------------------------------------
  // Find the critic that produced the current result
  // ----------------------------------------------------------

  const criticNodes =
    Object.values(graph.nodes)
      .filter(
        node =>
          node.agent === "critic" &&
          node.status === "done" &&
          node.result
      )
      .sort(
        (a, b) =>
          (b.completedAt || b.createdAt || 0) -
          (a.completedAt || a.createdAt || 0)
      );

  const sourceCritic =
    criticNodes[0];

  const depends =
    sourceCritic
      ? [sourceCritic.id]
      : [];

  // ----------------------------------------------------------
  // Prevent duplicate repair tasks
  // ----------------------------------------------------------

  const existingKeys =
    new Set(
      Object.values(graph.nodes).map(
        node =>
          `${node.agent}:${String(
            node.input || ""
          )
            .trim()
            .toLowerCase()}`
      )
    );

  const injectedIds = [];

  function inject(agent, input) {

    if (!agent || !input) {
      return;
    }

    const normalized =
      String(input)
        .trim();

    if (!normalized) {
      return;
    }

    const key =
      `${agent}:${normalized.toLowerCase()}`;

    if (existingKeys.has(key)) {
      return;
    }

    existingKeys.add(key);

    const id =
      crypto.randomUUID();

    addTask(graph, {
      id,
      type: "agent",
      agent,
      input: normalized,
      dependsOn: depends,
      priority: 8
    });

    injectedIds.push(id);
  }

  // ----------------------------------------------------------
  // Generate repair tasks
  // ----------------------------------------------------------

  for (const issue of issues) {

    const issueAgent =
      String(issue?.agent || "").toLowerCase();

    const agent =
      issueAgent === "frontend"
        ? "frontend"
        : issueAgent === "backend"
          ? "backend"
          : "repair";

    const instruction =
      issue?.fix ||
      issue?.description ||
      issue?.message;

    inject(
      agent,
      instruction
    );
  }

  // ----------------------------------------------------------
  // If nothing new was injected, stop.
  // ----------------------------------------------------------

  if (!injectedIds.length) {

    return {
      ok: true,
      repaired: 0,
      totalIssues: issues.length,
      hasIssues: true,
      reason: "no_new_repair_tasks",
      reflectionCount:
        graph.meta.reflectionCount
    };
  }

  // ----------------------------------------------------------
  // Verification critic
  // ----------------------------------------------------------

  const verificationCriticId =
    crypto.randomUUID();

  addTask(graph, {
    id: verificationCriticId,
    type: "agent",
    agent: "critic",
    input:
      `Review the repaired workspace and verify whether the reported issues are completely resolved. Reflection ${graph.meta.reflectionCount}.`,
    dependsOn: injectedIds,
    priority: 10
  });

  // ----------------------------------------------------------
  // Final output must wait for verification critic
  // ----------------------------------------------------------

const finalNode =
  graph.nodes["final_output"];

if (finalNode) {

  resetTask(
    graph,
    finalNode.id
  );

  updateTask(
    graph,
    finalNode.id,
    {
      dependsOn: [
        verificationCriticId
      ]
    }
  );
}

  return {
    ok: true,

    repaired:
      injectedIds.length,

    totalIssues:
      issues.length,

    hasIssues:
      true,

    verificationCriticId,

    repairTaskIds:
      injectedIds,

    criticalCount:
      criticalIssues.length,

    reflectionCount:
      graph.meta.reflectionCount
  };
}
