const agentMemoryStore = new Map();

// ================= GET =================
export function getAgentMemory(agent) {

  if (!agentMemoryStore.has(agent)) {

    agentMemoryStore.set(agent, {
      agent,
      runs: 0,
      successes: 0,
      failures: 0,
      lastTasks: [],
      notes: [],
      specialization: {}
    });

  }

  return agentMemoryStore.get(agent);
}

// ================= UPDATE =================
export function updateAgentMemory(agent, patch = {}) {

  const current = getAgentMemory(agent);

  const updated = {
    ...current,
    ...patch
  };

  agentMemoryStore.set(agent, updated);

  return updated;
}

// ================= RECORD TASK =================
export function recordAgentTask({
  agent,
  task,
  success = true
}) {

  const memory = getAgentMemory(agent);

  // ===== RUNS =====
  memory.runs++;

  // ===== SUCCESS / FAILURE =====
  if (success) {
    memory.successes++;
  } else {
    memory.failures++;
  }

const type =
  typeof task === "string"
    ? task.split(" ")[0].toLowerCase()
    : "general";

memory.specialization[type] =
  (memory.specialization[type] || 0) + 1;

  // ===== TASK HISTORY =====
  memory.lastTasks.unshift({
    task,
    success,
    ts: Date.now()
  });

  memory.lastTasks =
    memory.lastTasks.slice(0, 20);


  // ===== SAVE =====
  agentMemoryStore.set(agent, memory);

  return memory;
}
