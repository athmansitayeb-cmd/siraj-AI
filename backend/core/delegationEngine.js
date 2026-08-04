import {
  getAgent,
  resolveAgent,
  registerDynamicAgent
} from "./agentRegistry.js";
import { runAgent } from "./agentRouter.js";

export async function delegateTask({ from, to, task, context = {} }) {

let agent =
  getAgent(to) ||
  resolveAgent(task);

if (!agent && to) {
  agent = registerDynamicAgent(to);
}

if (!agent) {
  return {
    from,
    to,
    task,
    error: "NO_AGENT_AVAILABLE"
  };
}

  try {
    const result = await runAgent({
      agent: agent.name,
      input: task,
      context
    });

    return {
      from,
      to,
      task,
      result,
      status: "success"
    };

  } catch (e) {
    return {
      from,
      to,
      task,
      error: e.message,
      status: "failed"
    };
  }
}
