import { getWorkspaceMemory, updateWorkspaceMemory }
from "./workspaceMemory.js";

export async function publishKnowledge(workspaceId, agent, data) {

  const memory = await getWorkspaceMemory(workspaceId);

const shared = Array.isArray(memory.sharedContext)
  ? [...memory.sharedContext]
  : [];

shared.push({
  agent,
  data,
  ts: Date.now()
});

// احتفظ بآخر 100 حدث فقط
const MAX_EVENTS = 100;

while (shared.length > MAX_EVENTS) {
  shared.shift();
}

await updateWorkspaceMemory(workspaceId, {
  sharedContext: shared
});

  return true;
}

export async function readKnowledge(workspaceId) {

  const memory = await getWorkspaceMemory(workspaceId);

  return memory.sharedContext || [];
}
