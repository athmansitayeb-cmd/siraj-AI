import { listAgents, getAgent } from "./agentRegistry.js";
import { getAgentMemory } from "./agentMemory.js";
import { scoreAgent } from "./agentScoring.js";

// ================= SELECT =================
export function selectBestAgent(task) {

  let best = null;
  let bestScore = -Infinity;

  const agents = listAgents(); // ⬅️ هذا المهم

  for (const agentName of agents) {

    const memory =
      getAgentMemory(agentName);

    const score =
      scoreAgent(memory);

    const specialization =
      memory.specialization || {};

const type =
  typeof task?.input === "string"
    ? task.input.split(" ")[0].toLowerCase()
    : "general";

    const specBonus =
      specialization[type] || 0;

    const finalScore =
      score + specBonus;

    if (finalScore > bestScore) {

      bestScore = finalScore;

      best = {
        name: agentName,
        score: finalScore
      };
    }
  }

  return best;
}
