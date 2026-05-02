export function applyMemoryDecay(memory) {
  const MAX = 10;
  const DAYS_LIMIT = 7;

  const now = Date.now();
  const week = 1000 * 60 * 60 * 24 * DAYS_LIMIT;

  // ================= TIME DECAY =================
  const filterOld = (arr) => {
    if (!arr) return [];
    return arr.slice(-MAX);
  };

  // ================= APPLY LIMITS =================
  memory.goals = filterOld(memory.goals);
  memory.struggles = filterOld(memory.struggles);
  memory.habits = filterOld(memory.habits);
  memory.stateHistory = filterOld(memory.stateHistory);

  // ================= RESET OLD STATE =================
  if (memory.lastCheckAt && (now - new Date(memory.lastCheckAt).getTime()) > week) {
    memory.lastState = "normal";
  }

  // ================= UPDATE ACTIVITY =================
  memory.lastActiveAt = new Date();

  return memory;
}
