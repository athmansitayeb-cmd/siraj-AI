import { getAgent } from "./agentRegistry.js";

import {
  getAgentMemory,
  recordAgentTask
} from "./agentMemory.js";

import { writeWorkspaceFile }
  from "./workspaceFs.js";

// ================= ROUTER =================
export async function runAgent({
  agent,
  input,
  context = {}
}) {

  const target = getAgent(agent);

  if (!target) {
    throw new Error(`Agent not found: ${agent}`);
  }

  // ================= MEMORY =================
  const memory = getAgentMemory(agent);

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

    // ================= EXECUTE =================
    const result = await target.execute({
      input,
      context: enrichedContext
    });

// ================= AUTO SAVE OUTPUT =================
if (context?.workspaceId) {

  const filename =
    `${agent}_${Date.now()}.md`;

  await writeWorkspaceFile({
    workspaceId: context.workspaceId,
    file: `logs/${filename}`,
    content:
      typeof result === "string"
        ? result
        : JSON.stringify(result, null, 2)
  });

}

    // ================= RECORD =================
    recordAgentTask({
      agent,
      task: input,
      success: true
    });

    return {
      ok: true,
      agent,
      duration: Date.now() - startedAt,
      result
    };

  } catch (err) {

    // ================= RECORD FAILURE =================
    recordAgentTask({
      agent,
      task: input,
      success: false
    });

    return {
      ok: false,
      agent,
      duration: Date.now() - startedAt,
      error: err.message
    };
  }
}
