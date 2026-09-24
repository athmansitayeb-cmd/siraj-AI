import {
  getTool
} from "../toolRegistry.js";

import {
  getAgent
} from "../agentRegistry.js";

import {
  runAgent
} from "../agentRouter.js";

import {
  writeWorkspaceFile
} from "../workspaceFs.js";

import {
  normalizeOutput
} from "../utils/normalizeOutput.js";

import {
  shouldUseLLM
} from "../llmGate.js";

import {
  shouldForceLLM,
  getDependencyResults,
  getGraphResults
} from "./taskHelpers.js";

import {
  shouldUseCache,
  hashTask,
  cacheResult,
  hasCachedResult,
  getCachedResult
} from "./cache.js";

import {
  publishKnowledge
} from "../sharedWorkspaceBus.js";


export async function executeRuntimeTask({
  task,
  graph,
  runtimeContext = {},
  results = [],
  injectPlannerTasks
}) {

  // ==========================================================
  // SKIP
  // ==========================================================

  const input =
    typeof task.input === "string"
      ? task.input.trim()
      : "";

  if (
    task.type !== "synthesis" &&
    !input
  ) {

    return {
      ok: true,
      skipped: true,
      result: "skipped_task"
    };

  }


  // ==========================================================
  // DEPENDENCY RESULTS
  // ==========================================================

  const dependencyResults =
    getDependencyResults(
      task,
      graph
    );


  // ==========================================================
  // CACHE
  // ==========================================================

  const cacheContext = {
    ...runtimeContext,
    dependencyResults
  };

  const cacheKey =
    hashTask(
      task,
      cacheContext
    );

  if (
    shouldUseCache(task) &&
    hasCachedResult(cacheKey)
  ) {

    return {
      ...getCachedResult(cacheKey),
      cached: true
    };

  }


  let output;


  // ==========================================================
  // TOOL
  // ==========================================================

  if (
    task.type === "tool"
  ) {

    const tool =
      getTool(task.tool);

    if (!tool) {
      throw new Error(
        `Tool not found: ${task.tool}`
      );
    }

    output =
      await tool.execute(
        task.input
      );

  }


  // ==========================================================
  // AGENT
  // ==========================================================

  else if (
    task.type === "agent"
  ) {

    if (!task.agent) {
      throw new Error(
        "Task has no assigned agent"
      );
    }

    const selected =
      getAgent(task.agent);

    if (!selected) {
      throw new Error(
        `Agent '${task.agent}' not found`
      );
    }


    const graphResults =
      getGraphResults(
        graph
      );


    const agentInput = {

      original:
        runtimeContext.originalPrompt ||
        task.input,

      instruction:
        task.input,

      dependencies:
        dependencyResults,

      previousResults:
        results,

      graphResults,

      graph

    };


    if (
      selected.name === "planner"
    ) {

      console.log(
        "[PLANNER INPUT DEBUG]",
        JSON.stringify({
          original:
            agentInput.original,

          instruction:
            agentInput.instruction,

          workspaceId:
            runtimeContext.workspaceId

        }, null, 2)
      );

    }


    const agentContext = {

      role:
        task.role,

      task,

      planner:
        runtimeContext.planner,

      workspaceId:
        runtimeContext.workspaceId,

      workspace:
        runtimeContext.workspace,

      runtimeGraph:
        graph,

      previousResults:
        results,

      traceId:
        runtimeContext.traceId,

      intent:
        runtimeContext.intent,

      state:
        runtimeContext.state,

      mode:
        runtimeContext.mode,

      systemPrompt:
        runtimeContext.systemPrompt,

      originalPrompt:
        runtimeContext.originalPrompt

    };


    // ========================================================
    // LLM DECISION
    // ========================================================

    let useLLM =
      shouldUseLLM(
        selected.name,
        {
          task,
          input:
            task.input
        }
      );


    if (
      shouldForceLLM(task)
    ) {

      useLLM = true;

    }


    // ========================================================
    // EXECUTE
    // ========================================================

    let res;

    if (!useLLM) {

      res =
        await selected.execute({
          input:
            agentInput,

          context:
            agentContext
        });

    } else {

      res =
        await runAgent({

          agent:
            selected.name,

          input:
            agentInput,

          context:
            agentContext

        });

    }


    console.log(
      `[RAW ${selected.name.toUpperCase()} RESULT]`,
      {
        ok:
          res?.ok,

        hasOutput:
          !!res,

        files:
          Array.isArray(res?.files)
            ? res.files.length
            : 0
      }
    );


    // ========================================================
    // NORMALIZE
    // ========================================================

    output =
      normalizeOutput(
        res
      );


    console.log(
      `[NORMALIZED ${selected.name.toUpperCase()} RESULT]`,
      {
        ok:
          output?.ok,

        files:
          Array.isArray(
            output?.files
          )
            ? output.files.length
            : 0,

        hasError:
          !!output?.error
      }
    );


    // ========================================================
    // PLANNER DYNAMIC TASKS
    // ========================================================

    if (
      selected.name === "planner" &&
      typeof injectPlannerTasks ===
        "function" &&
      runtimeContext.mode !==
        "production_smoke" &&
      runtimeContext.allowPlannerExpansion !==
        false
    ) {

      const added =
        injectPlannerTasks(
          output
        );

      if (added.length) {

        console.log(
          "[GRAPH AFTER PLANNER]",
          Object.values(
            graph.nodes
          ).map(node => ({
            id:
              node.id,

            agent:
              node.agent,

            type:
              node.type,

            status:
              node.status,

            dependsOn:
              node.dependsOn
          }))
        );

      }

    }


    // ========================================================
    // CACHE SUCCESS
    // ========================================================

    if (
      output?.ok &&
      shouldUseCache(task)
    ) {

      cacheResult(
        cacheKey,
        output
      );

    }


    // ========================================================
    // WORKSPACE FILES
    // ========================================================

    const files =
      output?.files ||
      output?.result?.files ||
      [];


    if (
      runtimeContext.workspaceId &&
      Array.isArray(files) &&
      files.length
    ) {

      for (
        const file of files
      ) {

        if (!file?.path) {
          continue;
        }

        await writeWorkspaceFile({

          workspaceId:
            runtimeContext.workspaceId,

          file:
            file.path,

          content:
            file.content ?? ""

        });

      }

    }


    // ========================================================
    // SHARED KNOWLEDGE
    // ========================================================

    if (
      runtimeContext.workspaceId &&
      (
        output.pages?.length ||
        output.routes?.length ||
        output.entities?.length ||
        Object.keys(
          output.architecture || {}
        ).length
      )
    ) {

      const workspaceVersion =
        runtimeContext.workspace?.snapshot?.version || 1;

      await publishKnowledge(

        runtimeContext.workspaceId,

        task.agent,

        {

          pages:
            output.pages || [],

          routes:
            output.routes || [],

          entities:
            output.entities || [],

          architecture:
            output.architecture || {}

        },

        workspaceVersion

      );

    }

  }


  // ==========================================================
  // SYNTHESIS
  // ==========================================================

  else if (
    task.type === "synthesis"
  ) {

    const nodes =
      Object.values(
        graph.nodes
      ).filter(
        node =>
          node.id !== task.id
      );


    const files =
      nodes.flatMap(
        node =>
          node.result?.files ||
          []
      );


    const merged =
      nodes.map(node => ({

        task:
          node.id,

        status:
          node.status,

        output:
          node.result

      }));


    output = {

      ok: true,

      text:
        "Runtime synthesis completed.",

      data: {

        files,

        merged,

        summary: {

          totalTasks:
            nodes.length,

          success:
            nodes.filter(
              node =>
                node.status ===
                "done"
            ).length,

          failed:
            nodes.filter(
              node =>
                node.status ===
                "failed"
            ).length

        }

      },

      files

    };

  }


  // ==========================================================
  // UNKNOWN
  // ==========================================================

  else {

    output = {

      ok: false,

      error:
        `unknown_task_type:${task.type}`

    };

  }


  return output;

}
