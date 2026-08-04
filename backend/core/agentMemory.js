import {
  loadAgentMemory,
  saveAgentMemory
} from "./agentMemoryStore.js";

const agentMemoryStore = new Map();

// ================= GET =================
export async function getAgentMemory(agent) {

  if (agentMemoryStore.has(agent)) {
    return agentMemoryStore.get(agent);
  }

  const memory = await loadAgentMemory(agent) || {
    agent,
    version: 1,
    runs: 0,
    successes: 0,
    failures: 0,
    lastTasks: [],
    notes: [],
    specialization: {}
  };

  agentMemoryStore.set(agent, memory);

  return memory;
}

// ================= UPDATE =================
export function updateAgentMemory(agent, patch = {}) {

  const current = agentMemoryStore.get(agent) || {
    agent,
    runs: 0,
    successes: 0,
    failures: 0,
    lastTasks: [],
    notes: [],
    specialization: {}
  };

const updated = {

    ...current,

    ...patch,

    notes: [
      ...(current.notes || []),
      ...(patch.notes || [])
    ].slice(-100),

lastTasks: [
  ...(current.lastTasks || []),
  ...(patch.lastTasks || [])
].slice(-20),

    specialization: {
      ...(current.specialization || {}),
      ...(patch.specialization || {})
    }

  };

  agentMemoryStore.set(agent, updated);

  saveAgentMemory(agent, updated).catch(() => {});

  return updated;

}

// ================= RECORD TASK =================
export async function recordAgentTask({
  agent,
  task,
  success = true
}) {

  const memory = await getAgentMemory(agent);

  memory.runs++;

  memory.lastRun = Date.now();

  if (success) memory.successes++;
  else memory.failures++;

  const type =
    typeof task === "string"
      ? task.split(" ")[0].toLowerCase()
      : "general";

  memory.specialization[type] =
    (memory.specialization[type] || 0) + 1;

  memory.lastTasks.unshift({
    task,
    success,
    ts: Date.now()
  });

  memory.lastTasks = memory.lastTasks.slice(0, 20);

  agentMemoryStore.set(agent, memory);

  await saveAgentMemory(agent, memory);

  return memory;
}
