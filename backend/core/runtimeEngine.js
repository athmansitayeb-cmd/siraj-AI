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
  addTask,
  failBlockedTasks,
  updateTask
} from "./taskGraph.js";

import {
  getAgent,
  listAgents
} from "./agentRegistry.js";

import {
  scheduleTasks
} from "./taskScheduler.js";

import {
  validateTask
} from "./runtime/taskHelpers.js";

import { executeRuntimeTask } from "./runtime/taskExecutor.js";

import {
  runtimeReflectionLoop
} from "./runtimeReflectionLoop.js";

// ============================================================
// RUNTIME CONSTANTS
// ============================================================

const MAX_REPAIRS = 2;






// ============================================================
// EXECUTION ENGINE
// ============================================================

export async function executeTasks(
  tasks = [],
  runtimeContext = {}
) {

  // ----------------------------------------------------------
  // Normalize input
  // ----------------------------------------------------------

  tasks = Array.isArray(tasks)
    ? [...tasks]
    : [];

  // ----------------------------------------------------------
  // Available agents
  // ----------------------------------------------------------

  const availableAgents =
    new Set(listAgents());

  // ----------------------------------------------------------
  // Validate initial tasks
  // ----------------------------------------------------------

  const invalidTasks = tasks
    .map(task => ({
      task,
      validation:
        validateTask(
          task,
          availableAgents
        )
    }))
    .filter(item => !item.validation.ok);

  if (invalidTasks.length) {

    console.error(
      "[RUNTIME INVALID TASKS]",
      invalidTasks.map(item => ({
        id: item.task?.id,
        agent: item.task?.agent,
        reason: item.validation.reason
      }))
    );

    return {
      ok: false,
      error: "invalid_tasks",
      invalidTasks:
        invalidTasks.map(item => ({
          id: item.task?.id,
          agent: item.task?.agent,
          reason: item.validation.reason
        }))
    };
  }

  // ----------------------------------------------------------
  // Ensure critic exists for build workflows
  // ----------------------------------------------------------

  const hasCritic =
    tasks.some(
      task => task.agent === "critic"
    );

  const finalTask =
    tasks.find(
      task => task.type === "synthesis"
    );

  const hasBuildAgents =
    tasks.some(task =>
      task.type === "agent" &&
      [
        "planner",
        "frontend",
        "backend",
        "architect",
        "repair"
      ].includes(task.agent)
    );

  if (
    !hasCritic &&
    finalTask &&
    hasBuildAgents
  ) {

    const buildDependencies =
      [...(finalTask.dependsOn || [])];

tasks.push({
  id: "critic_1",
  type: "agent",
  agent: "critic",
  input: "Review generated workspace",
  dependsOn: buildDependencies,
  priority: 2,
  cost: 3,
  estimatedTime: 5
});

    // IMPORTANT:
    // The first critic is a quality gate,
    // therefore final must wait for it.
finalTask.dependsOn = [
  ...new Set([
    ...(finalTask.dependsOn || []),
    "critic_1"
  ])
];
  }

  // ----------------------------------------------------------
  // Validate again after critic injection
  // ----------------------------------------------------------

  const invalidAfterInjection =
    tasks
      .map(task => ({
        task,
        validation:
          validateTask(
            task,
            availableAgents
          )
      }))
      .filter(item => !item.validation.ok);

  if (invalidAfterInjection.length) {

    return {
      ok: false,
      error: "invalid_tasks_after_injection",
      invalidTasks:
        invalidAfterInjection.map(item => ({
          id: item.task?.id,
          agent: item.task?.agent,
          reason: item.validation.reason
        }))
    };
  }

  // ----------------------------------------------------------
  // Create graph
  // ----------------------------------------------------------

  let graph;

  try {

    graph =
      createTaskGraph(tasks);

  } catch (error) {

    console.error(
      "[RUNTIME GRAPH ERROR]",
      error
    );

    return {
      ok: false,
      error:
        error?.message ||
        "graph_creation_failed"
    };
  }

  // ----------------------------------------------------------
  // Runtime state
  // ----------------------------------------------------------

  const runtimeId =
    crypto.randomUUID();

  await createRuntimeState({
    runtimeId,
    workspaceId:
      runtimeContext.workspaceId,
    graph,
    status: "running"
  });

  // ----------------------------------------------------------
  // Results
  // ----------------------------------------------------------

  const results = [];

    // Keep one final result entry per task.
    // Retry attempts are tracked on graph.nodes[task.id].retries.
    const recordResult = entry => {
      const index = results.findIndex(
        result => result.taskId === entry.taskId
      );

      if (index >= 0) {
        results[index] = entry;
      } else {
        results.push(entry);
      }
    };

  // ----------------------------------------------------------
  // Repair state
  // ----------------------------------------------------------

  let repairAttempts = 0;

  // Latest critic result
  let latestCritic = null;

  // ----------------------------------------------------------
  // Helper: add planner tasks
  // ----------------------------------------------------------

  function injectPlannerTasks(plan) {

    if (
      !plan?.tasks ||
      !Array.isArray(plan.tasks)
    ) {
      return [];
    }

    const added = [];

    for (const task of plan.tasks) {

      if (!task?.id) {
        continue;
      }

      if (task.type === "agent") {

        if (!task.agent) {
          continue;
        }

        if (
          !availableAgents.has(
            task.agent
          )
        ) {
          console.warn(
            "[PLANNER INVALID AGENT]",
            task.agent,
            task.id
          );

          continue;
        }
      }

      try {

        const addedTask =
          addTask(graph, task);

        if (addedTask) {
          added.push(task);
        }

      } catch (error) {

        console.error(
          "[PLANNER ADD TASK ERROR]",
          {
            id: task.id,
            error:
              error?.message
          }
        );
      }
    }

    return added;
  }

  // ==========================================================
  // Main execution cycle
  // ==========================================================

  async function executeGraphUntilStable() {

    let safetyCounter = 0;

    const MAX_GRAPH_CYCLES = 1000;

    while (!isGraphDone(graph)) {

      safetyCounter++;

      if (
        safetyCounter >
        MAX_GRAPH_CYCLES
      ) {

        console.error(
          "[RUNTIME SAFETY STOP] Maximum graph cycles reached."
        );

        break;
      }

      // ------------------------------------------------------
      // Fail blocked tasks
      // ------------------------------------------------------

      failBlockedTasks(graph);

      // ------------------------------------------------------
      // Get ready tasks
      // ------------------------------------------------------

      const ready =
        getReadyTasks(graph);

      // Tasks waiting for retry backoff are not executable yet.
      const now =
        Date.now();

      const executableReady =
        ready.filter(
          task =>
            !task.retryAt ||
            task.retryAt <= now
        );

      const readyTasks =
        scheduleTasks(
          executableReady,
          graph,
          runtimeContext
        );

      // ------------------------------------------------------
      // Retry backoff
      // ------------------------------------------------------

      if (!readyTasks.length) {

        const retryWaiting =
          ready
            .filter(
              task =>
                task.retryAt &&
                task.retryAt > now
            );

        if (retryWaiting.length) {

          const nextRetryAt =
            Math.min(
              ...retryWaiting.map(
                task => task.retryAt
              )
            );

          const waitMs =
            Math.max(
              0,
              nextRetryAt - Date.now()
            );

          console.log(
            "[RUNTIME RETRY BACKOFF]",
            {
              waitMs,
              tasks:
                retryWaiting.map(
                  task => ({
                    id: task.id,
                    retryAt: task.retryAt,
                    retries: task.retries
                  })
                )
            }
          );

          await new Promise(
            resolve =>
              setTimeout(
                resolve,
                waitMs
              )
          );

          continue;
        }

        // ----------------------------------------------------
        // Deadlock protection
        // ----------------------------------------------------

        const unfinished =
          Object.values(graph.nodes)
            .filter(
              node =>
                node.status === "pending" ||
                node.status === "running"
            );

        if (unfinished.length) {

          console.error(
            "[RUNTIME DEADLOCK]",
            unfinished.map(node => ({
              id: node.id,
              type: node.type,
              agent: node.agent,
              status: node.status,
              dependsOn:
                node.dependsOn
            }))
          );
        }

        break;
      }

      // ------------------------------------------------------
      // Execute ready tasks
      // ------------------------------------------------------

      await Promise.all(
        readyTasks.map(
          async task => {

            try {

              // ------------------------------------------------
              // Execute task
              // ------------------------------------------------

              graph.nodes[task.id].status = "running";

              const output =
                await executeRuntimeTask({
                  task,
                  graph,
                  runtimeContext,
                  results,
                  injectPlannerTasks
                });

              // =================================================
              // OUTPUT FAILURE
              // =================================================

              if (
                output?.ok === false
              ) {

                const optional =
                  task.optional === true;

                if (optional) {

                  graph.nodes[
                    task.id
                  ].status = "failed";

                  graph.nodes[
                    task.id
                  ].result = {
                    ok: false,
                    optional: true,
                    error:
                      output.error ||
                      "optional_agent_failed"
                  };

                  graph.nodes[
                    task.id
                  ].error =
                    output.error ||
                    "optional_agent_failed";

                  console.warn(
                    "[OPTIONAL TASK FAILED]",
                    task.id,
                    output.error
                  );

                  recordResult({
                    taskId:
                      task.id,

                    status:
                      "failed",

                    optional: true,

                    error:
                      output.error,

                    output
                  });

                  return;
                }

                failTask(
                  graph,
                  task.id,
                  output.error ||
                    "agent_failed"
                );

                recordResult({
                  taskId:
                    task.id,

                  status:
                    "failed",

                  error:
                    output.error,

                  output
                });

                return;
              }

              // =================================================
              // COMPLETE
              // =================================================

              completeTask(
                graph,
                task.id,
                output
              );

              recordResult({
                taskId:
                  task.id,

                status:
                  "done",

                output
              });

              // ------------------------------------------------
              // Capture critic
              // ------------------------------------------------

              if (
                task.agent ===
                "critic"
              ) {

                latestCritic =
                  output;
              }

              await updateRuntimeState(
                runtimeId,
                {
                  graph
                }
              );

            } catch (error) {

              const errorMessage =
                error?.message ||
                "task_failed";

              const optional =
                task.optional === true;

              if (optional) {

                graph.nodes[
                  task.id
                ].status = "failed";

                graph.nodes[
                  task.id
                ].result = {
                  ok: false,
                  optional: true,
                  error:
                    errorMessage
                };

                graph.nodes[
                  task.id
                ].error =
                  errorMessage;

                console.warn(
                  "[OPTIONAL TASK ERROR]",
                  task.id,
                  errorMessage
                );

                recordResult({
                  taskId:
                    task.id,

                  status:
                    "failed",

                  optional: true,

                  error:
                    errorMessage
                });

              } else {

                failTask(
                  graph,
                  task.id,
                  errorMessage
                );

                recordResult({
                  taskId:
                    task.id,

                  status:
                    "failed",

                  error:
                    errorMessage
                });
              }

              await updateRuntimeState(
                runtimeId,
                {
                  graph
                }
              );
            }
          }
        )
      );

      await updateRuntimeState(
        runtimeId,
        {
          graph
        }
      );
    }

    return graph;
  }

  // ==========================================================
  // INITIAL EXECUTION
  // ==========================================================

  await executeGraphUntilStable();

  // ==========================================================
  // REFLECTION / REPAIR LOOP
  // ==========================================================

  while (
    repairAttempts < MAX_REPAIRS
  ) {

    const criticNode =
      Object.values(graph.nodes)
        .filter(
          node =>
            node.agent === "critic" &&
            node.result
        )
        .sort(
          (a, b) =>
            (b.completedAt || 0) -
            (a.completedAt || 0)
        )[0];

    if (!criticNode) {
      break;
    }

    latestCritic =
      criticNode.result;

    const criticData =
      latestCritic?.data ||
      latestCritic;

    const issues =
      criticData?.issues ||
      latestCritic?.issues ||
      [];

    if (
      !Array.isArray(issues) ||
      issues.length === 0
    ) {

      console.log(
        "[RUNTIME] Critic found no issues."
      );

      break;
    }

    // --------------------------------------------------------
    // Increment repair attempt
    // --------------------------------------------------------

    repairAttempts++;

    console.log(
      `[RUNTIME REPAIR] Attempt ${repairAttempts}/${MAX_REPAIRS}`
    );

    // --------------------------------------------------------
    // Reflection loop
    // --------------------------------------------------------

    const reflection =
      await runtimeReflectionLoop({

        graph,

        criticResult:
          latestCritic,

        rerunTask:
          async taskId => {

            const node =
              graph.nodes[taskId];

            if (!node) {
              return false;
            }

            node.status =
              "pending";

            node.result =
              null;

            node.error =
              null;

            return true;
          },

        updatePlan:
          async patch => {

            const planner =
              getAgent("planner");

            if (!planner) {
              return;
            }

            try {

              const repairedPlan =
                await planner.execute({

                  input: {

                    original:
                      runtimeContext.originalPrompt,

                    instruction:
                      "Repair execution graph",

                    critic:
                      {
                        issues,

                        criticalCount:
                          issues.filter(
                            issue =>
                              issue.severity ===
                              "critical"
                          ).length,

                        patch
                      },

                    graph
                  },

                  context:
                    runtimeContext
                });

              const added =
                injectPlannerTasks(
                  repairedPlan
                );

              console.log(
                "[RUNTIME REPAIR PLAN]",
                {
                  addedTasks:
                    added.length
                }
              );

            } catch (error) {

              console.error(
                "[RUNTIME REPAIR PLANNER ERROR]",
                error
              );
            }
          }
      });

    await updateRuntimeState(
      runtimeId,
      {
        graph,
        reflection
      }
    );

    // --------------------------------------------------------
    // No repair tasks were created
    // --------------------------------------------------------

    const pendingRepairTasks =
      Object.values(graph.nodes)
        .filter(node =>
          node.status === "pending" &&
          (
            node.agent === "repair" ||
            node.agent === "frontend" ||
            node.agent === "backend" ||
            node.agent === "architect"
          )
        );

    if (!pendingRepairTasks.length) {

      console.warn(
        "[RUNTIME REPAIR] No repair tasks generated."
      );

      break;
    }

    // --------------------------------------------------------
    // Execute newly injected repair graph
    // --------------------------------------------------------

    await executeGraphUntilStable();

    // --------------------------------------------------------
    // Check if graph still has work
    // --------------------------------------------------------

    if (!isGraphDone(graph)) {
      continue;
    }

    // --------------------------------------------------------
    // Continue only if another critic exists
    // --------------------------------------------------------

const verificationCriticId =
  reflection?.verificationCriticId;

const newCritic =
  verificationCriticId
    ? graph.nodes[
        verificationCriticId
      ]
    : null;

if (!newCritic) {
  console.warn(
    "[RUNTIME REPAIR] Verification critic not found."
  );
  break;
}

if (
  newCritic.status !== "done" ||
  !newCritic.result
) {
  console.warn(
    "[RUNTIME REPAIR] Verification critic did not complete.",
    {
      id:
        verificationCriticId,
      status:
        newCritic.status
    }
  );

  break;
}

latestCritic =
  newCritic.result;

const newCriticData =
  latestCritic?.data ||
  latestCritic;

const remainingIssues =
  newCriticData?.issues ||
  latestCritic?.issues ||
  [];

if (
  !Array.isArray(remainingIssues) ||
  remainingIssues.length === 0
) {
  console.log(
    "[RUNTIME] Repair verification passed."
  );

  break;
}
  }

  // ==========================================================
  // FINAL SYNTHESIS SAFETY
  // ==========================================================

  let finalNode =
    Object.values(graph.nodes)
      .find(
        node =>
          node.type === "synthesis"
      );

  // If planner/repair removed or failed to create final task,
  // create one safely.
  if (!finalNode) {

    const finalId =
      "final_output";

    try {

      addTask(
        graph,
        {
          id: finalId,
          type: "synthesis",
          input:
            "Synthesize final workspace output",
          dependsOn:
            Object.values(graph.nodes)
              .filter(
                node =>
                  node.id !== finalId &&
                  node.status === "done"
              )
              .map(
                node =>
                  node.id
              )
        }
      );

      finalNode =
        graph.nodes[finalId];

    } catch (error) {

      console.error(
        "[RUNTIME FINAL TASK ERROR]",
        error
      );
    }
  }

  // ----------------------------------------------------------
  // Make final wait for latest successful critic
  // ----------------------------------------------------------

  const latestCriticNode =
    Object.values(graph.nodes)
      .filter(
        node =>
          node.agent === "critic" &&
          node.status === "done"
      )
      .sort(
        (a, b) =>
          (b.completedAt || 0) -
          (a.completedAt || 0)
      )[0];

  if (
    finalNode &&
    latestCriticNode &&
    finalNode.status === "pending"
  ) {

    const dependencies =
      new Set(
        finalNode.dependsOn || []
      );

    dependencies.add(
      latestCriticNode.id
    );

    updateTask(
      graph,
      finalNode.id,
      {
        dependsOn:
          [...dependencies]
      }
    );
  }

  // ----------------------------------------------------------
  // Execute final synthesis
  // ----------------------------------------------------------

  if (
    finalNode &&
    finalNode.status === "pending"
  ) {

    await executeGraphUntilStable();
  }

  // ==========================================================
  // FINAL STATE
  // ==========================================================

  const graphNodes =
    Object.values(
      graph.nodes
    );

  const failedTasks =
    graphNodes.filter(
      node =>
        node.status === "failed"
    );

  const pendingTasks =
    graphNodes.filter(
      node =>
        node.status === "pending" ||
        node.status === "running"
    );

  const unfinishedTasks =
    pendingTasks.length;

  const hasFatalFailure =
    failedTasks.some(node => !node.optional);

  const criticData =
    latestCritic?.data ||
    latestCritic;

  const criticPassed =
    !latestCritic ||
    criticData?.verdict === "approved";

  const graphCompleted =
    isGraphDone(graph) &&
    unfinishedTasks === 0 &&
    !hasFatalFailure &&
    criticPassed;

  // ==========================================================
  // FINAL FILE MAP
  // ==========================================================

  const finalFileMap =
    new Map();

  for (
    const node of graphNodes
  ) {

    const nodeFiles =
      node.result?.files ||
      node.result?.data?.files ||
      [];

    if (!Array.isArray(nodeFiles)) {
      continue;
    }

    for (
      const file of nodeFiles
    ) {

      if (!file?.path) {
        continue;
      }

      finalFileMap.set(
        file.path,
        file
      );
    }
  }

  const finalFiles =
    [...finalFileMap.values()];

  // ==========================================================
  // FINAL RUNTIME STATE
  // ==========================================================

  await updateRuntimeState(
    runtimeId,
    {
      status:
        graphCompleted
          ? "completed"
          : "incomplete",

      graph,

      repairAttempts
    }
  );

  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    ok:
      graphCompleted,

    runtimeId,

    graph,

    results,

    files:
      finalFiles,

    critic:
      latestCritic?.data ||
      latestCritic ||
      null,

    repairAttempts,

    summary: {

      totalTasks:
        graphNodes.length,

      success:
        graphNodes.filter(
          node =>
            node.status === "done"
        ).length,

      failed:
        graphNodes.filter(
          node =>
            node.status === "failed"
        ).length,

      pending:
        graphNodes.filter(
          node =>
            node.status === "pending"
        ).length,

      running:
        graphNodes.filter(
          node =>
            node.status === "running"
        ).length,

      completed:
        graphCompleted
    }
  };
}
