import { getAgent } from "./agentRegistry.js";

import {
  getAgentMemory,
  recordAgentTask
} from "./agentMemory.js";

import { writeWorkspaceFile }
  from "./workspaceFs.js";

import { normalizeAgentOutput }
  from "./utils/agentOutputNormalizer.js";

// ================= ROUTER =================
export async function runAgent({
  agent,
  input,
  context = {}
}) {

  const target = getAgent(agent);

  console.log("[ROUTER]", agent, !!target);

  if (!target) {
    throw new Error(`Agent not found: ${agent}`);
  }

  const memory = await getAgentMemory(agent);

  const specialization =
    memory.specialization || {};

  const score =
    memory.successes -
    memory.failures * 0.5;

  const enrichedContext = {

    ...context,

    agentMeta: {
      name: agent,
      score,
      runs: memory.runs,
      specialization
    },

    agentMemory: memory

  };

  const startedAt = Date.now();

  try {

    const rawResult = await target.execute({
      input,
      context: enrichedContext
    });

    const result =
      normalizeAgentOutput(rawResult);

    if (
      !result.text &&
      !Object.keys(result.data || {}).length &&
      !(result.files || []).length
    ) {
      throw new Error("Agent returned empty output");
    }

    if (context.workspaceId) {

      await writeWorkspaceFile({

        workspaceId: context.workspaceId,

        file:
          `logs/${agent}_${Date.now()}.json`,

        content:
          JSON.stringify(result, null, 2)

      });

    }

    await recordAgentTask({

      agent,

      task: input,

      success: true

    });

    return {

      ...result,

      agent,

      duration:
        Date.now() - startedAt

    };

  }

  catch (err) {

    await recordAgentTask({

      agent,

      task: input,

      success: false

    });

    if (context.workspaceId) {

      await writeWorkspaceFile({

        workspaceId: context.workspaceId,

        file:
          `logs/${agent}_error_${Date.now()}.json`,

        content: JSON.stringify({

          agent,

          input,

          error: err.message,

          stack: err.stack

        }, null, 2)

      });

    }

    return {

      ok: false,

      agent,

      duration:
        Date.now() - startedAt,

      error: err.message

    };

  }

}
