export function buildMemoryGraph(memory) {
  return {
    nodes: [
      ...(memory?.goals || []).map(g => ({ type: "goal", value: g })),
      ...(memory?.struggles || []).map(s => ({ type: "struggle", value: s })),
      ...(memory?.habits || []).map(h => ({ type: "habit", value: h }))
    ],

    state: memory?.lastState || "unknown",

    dominantGoal: memory?.goals?.slice(-1)[0] || null,
    mainStruggle: memory?.struggles?.slice(-1)[0] || null,

    summary() {
      return {
        goalsCount: memory?.goals?.length || 0,
        strugglesCount: memory?.struggles?.length || 0,
        habitsCount: memory?.habits?.length || 0,
        dominantState: memory?.lastState || "unknown"
      };
    }
  };
}
