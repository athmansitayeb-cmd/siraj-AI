import { getAgent } from "./agentRegistry.js";

export function unifiedPlanner({
  msg,
  cognition
}) {

  console.log("===== UNIFIED PLANNER v5 =====");

  const text = String(msg || "").trim();
  const lower = text.toLowerCase();

  const intent = cognition?.intent || "general";

  // ================= SIMPLE CONVERSATION =================
  const simpleConversation =
    text.length < 40 &&
    !/(build|create|generate|design|system|architecture|dashboard|api|database|backend|frontend|project|application|app)/i.test(lower);

  if (simpleConversation) {

    return {
      version: "v5-conversation",
      intent: "conversation",
      tasks: [
        {
          id: "assistant_1",
          type: "agent",
          agent: "assistant",
          input: text
        },
        {
          id: "final_output",
          type: "synthesis",
          dependsOn: ["assistant_1"]
        }
      ]
    };

  }

  // ================= SINGLE SPECIALIZED AGENT =================
  const routing = [
    {
      regex: /(research|search|analyze)/i,
      agent: "research"
    },
    {
      regex: /(frontend|react|jsx|ui|page)/i,
      agent: "frontend"
    },
    {
      regex: /(backend|express|server|api|database|auth)/i,
      agent: "backend"
    },
    {
      regex: /(architecture|design|system)/i,
      agent: "architect"
    }
  ];

  for (const rule of routing) {

    if (rule.regex.test(lower) && text.length < 120) {

      if (getAgent(rule.agent)) {

        return {
          version: "v5-single-agent",
          intent: rule.agent,
          tasks: [
            {
              id: `${rule.agent}_1`,
              type: "agent",
              agent: rule.agent,
              input: text
            },
            {
              id: "final_output",
              type: "synthesis",
              dependsOn: [`${rule.agent}_1`]
            }
          ]
        };

      }

    }

  }

  // ================= COMPLEX PROJECT =================
  return {

    version: "v5-planner",

    intent: "complex",

    tasks: [

      {
        id: "planner_1",
        type: "agent",
        agent: "planner",
        input: text
      },

      {
        id: "final_output",
        type: "synthesis",
        dependsOn: ["planner_1"]
      }

    ]

  };

}
