import { getAgent } from "./agentRegistry.js";

import {
  getAgentMemory,
  recordAgentTask
} from "./agentMemory.js";

import { writeWorkspaceFile }
  from "./workspaceFs.js";

import { normalizeAgentOutput }
  from "./utils/agentOutputNormalizer.js";

import { readKnowledge } from "./sharedWorkspaceBus.js";
import { listWorkspaceFiles } from "./workspaceFs.js";

// ================= ROUTER =================
function compactOutput(data = {}) {
  return {
    ...data,

    files: (data.files || []).map(file => ({
      path: file.path,
      size: file.content
        ? Buffer.byteLength(file.content, "utf8")
        : 0
    }))
  };
}

export async function runAgent({
  agent,
  input,
  context = {}
}) {

  const target = getAgent(agent);

  console.log("[ROUTER]", agent, !!target);

if (!target?.execute) {
  throw new Error(`Agent '${agent}' has no execute() implementation`);
}

  if (!target) {
    throw new Error(`Agent not found: ${agent}`);
  }

  const memory = await getAgentMemory(agent);

let workspaceKnowledge =
  context.workspace?.knowledge || [];

let workspaceFiles =
  context.workspace?.files || [];

if (
  context.workspaceId &&
  workspaceKnowledge.length === 0
) {
  workspaceKnowledge =
    await readKnowledge(context.workspaceId);
}

if (
  context.workspaceId &&
  workspaceFiles.length === 0
) {
  workspaceFiles =
    await listWorkspaceFiles(context.workspaceId);
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

  files: workspaceFiles,

  knowledge: workspaceKnowledge

},

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

console.log(
  "[RAW AGENT EXECUTE]",
  JSON.stringify(compactOutput(rawResult), null, 2)
);

    const result =
      normalizeAgentOutput(rawResult);

console.log(
  "[NORMALIZED AGENT]",
  JSON.stringify(compactOutput(result), null, 2)
);

const hasContent =
  !!result.text ||
  Object.keys(result.data || {}).length > 0 ||
  (result.files?.length || 0) > 0 ||
  (result.tasks?.length || 0) > 0 ||
  (result.routes?.length || 0) > 0 ||
  (result.pages?.length || 0) > 0 ||
  (result.entities?.length || 0) > 0 ||
  (result.architecture &&
   Object.keys(result.architecture).length > 0);

if (!hasContent) {
  throw new Error("Agent returned empty output");
}

if (context.workspaceId && context.traceId) {

  await writeWorkspaceFile({

    workspaceId: context.workspaceId,

    file:
      `logs/${context.traceId}_${agent}_${Date.now()}.json`,

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

const memory = await getAgentMemory(agent);

memory.lastDuration = Date.now() - startedAt;
memory.lastSuccess = Date.now();

if (context.workspaceId && context.traceId) {

  await writeWorkspaceFile({

    workspaceId: context.workspaceId,

    file:
      `logs/${context.traceId}_${agent}_error_${Date.now()}.json`,

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
