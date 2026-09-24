import { getAgent } from "./agentRegistry.js";

import {
  getAgentMemory,
  recordAgentTask
} from "./agentMemory.js";

import Workspace from "../models/Workspace.js";

import {
  writeWorkspaceFile,
  listWorkspaceFiles
} from "./workspaceFs.js";

import { normalizeAgentOutput }
  from "./utils/agentOutputNormalizer.js";

import { readKnowledge }
  from "./sharedWorkspaceBus.js";

// ============================================================
// WORKSPACE AGENT STATUS
// ============================================================

async function updateWorkspaceAgentStatus(
  workspaceId,
  agent,
  status
) {
  if (!workspaceId || !agent) {
    return;
  }

  try {

    const workspace =
      await Workspace.findById(workspaceId);

    if (!workspace) {
      console.warn(
        "[WORKSPACE] Workspace not found:",
        workspaceId
      );
      return;
    }

    const agentEntry =
      workspace.agents?.find(
        item => item.name === agent
      );

    if (!agentEntry) {
      console.warn(
        "[WORKSPACE] Agent not registered:",
        agent
      );
      return;
    }

    agentEntry.status = status;

    const hasRunningAgents =
      workspace.agents.some(
        item => item.status === "running"
      );

    if (hasRunningAgents) {

      workspace.runtimeState = "executing";

    } else if (status === "failed") {

      workspace.runtimeState = "failed";

    } else {

      workspace.runtimeState = "idle";

    }

    workspace.lastSessionAt =
      new Date();

    await workspace.save();

    console.log(
      "[WORKSPACE AGENT STATUS]",
      agent,
      status
    );

  } catch (error) {

    console.error(
      "[WORKSPACE STATUS UPDATE ERROR]",
      error.message
    );

  }
}

// ============================================================
// COMPACT OUTPUT
// ============================================================

function compactOutput(data = {}) {

  return {

    ...data,

    files: (data.files || []).map(file => ({
      path: file.path,
      size: file.content
        ? Buffer.byteLength(
            file.content,
            "utf8"
          )
        : 0
    }))

  };

}

// ============================================================
// ROUTER
// ============================================================

export async function runAgent({

  agent,

  input,

  context = {}

}) {

  const target =
    getAgent(agent);

  if (!target) {

    throw new Error(
      `Agent not found: ${agent}`
    );

  }

  if (
    typeof target.execute !==
    "function"
  ) {

    throw new Error(
      `Agent '${agent}' has no execute() implementation`
    );

  }

  console.log(
    "[ROUTER]",
    agent,
    true
  );

  // ==========================================================
  // AGENT STARTED
  // ==========================================================

  await updateWorkspaceAgentStatus(
    context.workspaceId,
    agent,
    "running"
  );

  const memory =
    await getAgentMemory(agent);

  let workspaceKnowledge =
    context.workspace?.knowledge || [];

  let workspaceFiles =
    context.workspace?.files || [];

  if (
    context.workspaceId &&
    workspaceKnowledge.length === 0
  ) {

    workspaceKnowledge =
      await readKnowledge(
        context.workspaceId,
        context.workspace?.snapshot?.version || 1
      );

  }

  if (
    context.workspaceId &&
    workspaceFiles.length === 0
  ) {

    workspaceFiles =
      await listWorkspaceFiles(
        context.workspaceId
      );

  }

  const specialization =
    memory.specialization || {};

  const score =
    memory.successes -
    memory.failures * 0.5;

  const enrichedContext = {

    ...context,

    workspace: {

      ...(context.workspace || {}),

      files:
        workspaceFiles,

      knowledge:
        workspaceKnowledge

    },

    agentMeta: {

      name: agent,

      score,

      runs: memory.runs,

      specialization

    },

    agentMemory:
      memory

  };

  const startedAt =
    Date.now();

  try {

    const rawResult =
      await target.execute({

        input,

        context:
          enrichedContext

      });

    console.log(
      "[RAW AGENT EXECUTE]",
      JSON.stringify(
        compactOutput(rawResult),
        null,
        2
      )
    );

    const result =
      normalizeAgentOutput(
        rawResult
      );

    console.log(
      "[NORMALIZED AGENT]",
      JSON.stringify(
        compactOutput(result),
        null,
        2
      )
    );

    const hasContent =

      !!result.text ||

      Object.keys(
        result.data || {}
      ).length > 0 ||

      (result.files?.length || 0) > 0 ||

      (result.tasks?.length || 0) > 0 ||

      (result.routes?.length || 0) > 0 ||

      (result.pages?.length || 0) > 0 ||

      (result.entities?.length || 0) > 0 ||

      (
        result.architecture &&
        Object.keys(
          result.architecture
        ).length > 0
      );

    if (!hasContent) {

      throw new Error(
        "Agent returned empty output"
      );

    }

    if (
      context.workspaceId &&
      context.traceId
    ) {

      await writeWorkspaceFile({

        workspaceId:
          context.workspaceId,

        file:
          `logs/${context.traceId}_${agent}_${Date.now()}.json`,

        content:
          JSON.stringify(
            result,
            null,
            2
          )

      });

    }

    await recordAgentTask({

      agent,

      task: input,

      success: true

    });

    // ========================================================
    // AGENT COMPLETED
    // ========================================================

    await updateWorkspaceAgentStatus(
      context.workspaceId,
      agent,
      "completed"
    );

    return {

      ...result,

      agent,

      duration:
        Date.now() -
        startedAt

    };

  }

  catch (err) {

    await recordAgentTask({

      agent,

      task: input,

      success: false

    });

    const memory =
      await getAgentMemory(agent);

    memory.lastDuration =
      Date.now() -
      startedAt;

    memory.lastSuccess =
      Date.now();

    if (
      context.workspaceId &&
      context.traceId
    ) {

      await writeWorkspaceFile({

        workspaceId:
          context.workspaceId,

        file:
          `logs/${context.traceId}_${agent}_error_${Date.now()}.json`,

        content:
          JSON.stringify({

            agent,

            input,

            error:
              err.message,

            stack:
              err.stack

          }, null, 2)

      });

    }

    // ========================================================
    // AGENT FAILED
    // ========================================================

    await updateWorkspaceAgentStatus(
      context.workspaceId,
      agent,
      "failed"
    );

    return {

      ok: false,

      agent,

      duration:
        Date.now() -
        startedAt,

      error:
        err.message

    };

  }

}
