// ================= SCORE AGENT =================
export function scoreAgent(memory) {

  if (!memory) return 0;

  const successRate =
    memory.runs > 0
      ? memory.successes / memory.runs
      : 0;

  const failurePenalty =
    memory.failures * 0.15;

const specializationBonus =
  Math.min(
    Object.values(memory.specialization || {})
      .reduce((a, b) => a + b, 0) * 0.05,
    5
  );

  const score =
    successRate * 10 +
    specializationBonus -
    failurePenalty;

  return Number(score.toFixed(2));
}
