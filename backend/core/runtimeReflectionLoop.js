import crypto from "crypto";

import { addTask } from "./taskGraph.js";

export async function runtimeReflectionLoop({
  graph,
  criticResult,
  rerunTask,
  updatePlan
}) {

  graph.reflectionCount =
    (graph.reflectionCount || 0) + 1;

  if (graph.reflectionCount > 3) {
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

  const criticNode = Object.values(graph.nodes)
    .find(n => n.agent === "critic");

  const depends =
    criticNode ? [criticNode.id] : [];

  function inject(agent, input) {

    const key = `${agent}:${input}`;

    if (injected.has(key)) return;

    injected.add(key);

    addTask(graph, {
      id: crypto.randomUUID(),
      type: "agent",
      agent,
      input,
      dependsOn: depends
    });

  }

  // ================= AUTO REPAIR =================

  for (const issue of issues) {

    if (issue.type === "missing_frontend_login") {

      if (graph.nodes["frontend_1"]) {
        graph.nodes["frontend_1"].input =
          "create Login.jsx with React state and form validation";
      }

      inject(
        "frontend",
        "create Login.jsx with React state and form validation"
      );
    }

    else if (issue.type === "missing_backend_server") {

      if (graph.nodes["backend_1"]) {
        graph.nodes["backend_1"].input =
          "create Express server.js with auth routes";
      }

      inject(
        "backend",
        "create Express server.js with auth routes"
      );
    }

    else if (issue.type === "missing_page") {

      inject(
        "frontend",
        issue.fix
      );

    }

    else if (issue.type === "missing_entity") {

      inject(
        "backend",
        issue.fix
      );

    }

    else if (issue.type === "frontend_missing_route") {

      inject(
        "frontend",
        issue.fix
      );

    }

    else if (issue.type.includes("missing_route")) {

      const route = issue.meta?.route;

      if (route && graph.nodes["backend_1"]) {
        graph.nodes["backend_1"].input +=
          `\nensure route ${route}`;
      }

      inject(
        "backend",
        `implement route ${route}`
      );

    }

  }

  // ================= SECOND CRITIC PASS =================

  if (issues.length > 0) {

    const repairTasks = Object.values(graph.nodes)
      .filter(n =>
        n.agent === "frontend" ||
        n.agent === "backend"
      )
      .map(n => n.id);

    addTask(graph, {
      id: crypto.randomUUID(),
      type: "agent",
      agent: "critic",
      input: "review repaired workspace",
      dependsOn: repairTasks
    });

    await updatePlan({
      improve: true,
      issues,
      criticalCount: criticalIssues.length
    });

  }

  return {
    ok: true,
    repaired: criticalIssues.length,
    totalIssues: issues.length,
    hasIssues: issues.length > 0,
    reflectionCount: graph.reflectionCount
  };

}
