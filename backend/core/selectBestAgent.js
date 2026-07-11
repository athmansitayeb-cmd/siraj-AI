import { listAgents } from "./agentRegistry.js";
import { loadAgentMemory } from "./agentMemoryStore.js";
import { scoreAgent } from "./agentScoring.js";

export async function selectBestAgent(task = {}) {

  const agents = listAgents();

  const text = String(task.input || "").toLowerCase();
  const intent = String(task.intent || "").toLowerCase();

  let best = null;
  let bestScore = -Infinity;

  for (const agentName of agents) {

    const memory = await loadAgentMemory(agentName);

    let score = scoreAgent(memory);

    // ================= EXPLICIT AGENT =================
    if (task.agent === agentName) {
      score += 100;
    }

    // ================= HARD HINT =================
    if (task.hint === agentName) {
      score += 25;
    }

    // ================= SPECIALIZATION =================
    const specialization = memory.specialization || {};

    for (const key of Object.keys(specialization)) {

      if (text.includes(key.toLowerCase())) {
        score += specialization[key] * 0.15;
      }

    }

    // ================= INTENT ROUTING =================
    if (agentName === "planner" && intent === "complex") score += 20;

    if (agentName === "research" &&
        /(research|analyze|search)/.test(text)) score += 12;

    if (agentName === "architect" &&
        /(architecture|design|system)/.test(text)) score += 12;

    if (agentName === "frontend" &&
        /(frontend|react|ui|page|jsx)/.test(text)) score += 12;

    if (agentName === "backend" &&
        /(backend|express|server|api|database|auth)/.test(text)) score += 12;

    if (agentName === "critic") {
      score -= 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = {
        name: agentName,
        score
      };
    }
  }

  return best || {
    name: "assistant",
    score: 0
  };
}
