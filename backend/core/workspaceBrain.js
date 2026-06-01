const brainStore = new Map();

// ================= GET =================
export function getWorkspaceBrain(id) {
  return brainStore.get(id) || {
    state: "IDLE",
    goal: null,
    activePlan: null,
    activeTasks: [],
    events: []
  };
}

// ================= UPDATE STATE =================
export function updateWorkspaceBrain(id, patch) {
  const current = getWorkspaceBrain(id);

  const updated = {
    ...current,
    ...patch
  };

  brainStore.set(id, updated);
  return updated;
}

// ================= ADD EVENT =================
export function pushWorkspaceEvent(id, event) {
  const brain = getWorkspaceBrain(id);
  if (!brain.events) brain.events = [];

  brain.events.push({
    ...event,
    ts: Date.now()
  });

  brainStore.set(id, brain);
}

// ================= SNAPSHOT =================
export function snapshotWorkspaceBrain(id) {
  return structuredClone(getWorkspaceBrain(id));
}
