import { registerAgent } from "../agentRegistry.js";
import { unifiedPlanner } from "../unifiedPlanner.js";
import { delegateTask } from "../delegationEngine.js";

// ================= PLANNER AGENT =================
registerAgent("planner", {

  description: "Creates execution plans and delegates tasks",

  async execute({ input, context }) {

    // ================= PLAN =================
    const plan = unifiedPlanner({
      msg: input,
      memory: context.memory,
      reasoning: context.reasoning
    });

    // ================= RESEARCH DELEGATION =================
    let research = null;

    if (
      input.toLowerCase().includes("research") ||
      input.toLowerCase().includes("analyze")
    ) {

      research = await delegateTask({
        from: "planner",
        to: "research",
        task: input,
        context
      });

    }

    return {
      ok: true,
      type: "plan",
      plan,
      delegated: {
        research
      }
    };

  }

});
