import { getAgent } from "./agentRegistry.js";
import { runAgent } from "./agentRouter.js";

export async function delegateTask({ from, to, task, context = {} }) {

  const agent = getAgent(to);

  if (!agent) {
    return {
      from,
      to,
      task,
      error: "AGENT_NOT_FOUND"
    };
  }

  try {
    const result = await runAgent({
      agent: to,
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
