import { getAgent } from "./agentRegistry.js";

export function unifiedPlanner({
  msg,
  cognition
}) {

  console.log("===== UNIFIED PLANNER v6 =====");

  const text = String(msg || "").trim();
  const lower = text.toLowerCase();

  // ================= SIMPLE CONVERSATION =================

  const simpleConversation =
    text.length < 40 &&
    !/(build|create|generate|develop|design|system|architecture|dashboard|api|database|backend|frontend|project|application|app|software|platform|crm|saas|website|أنشئ|ابن|اصنع|طور|صمم|موقع|واجهة|قاعدة|بيانات|تطبيق|مشروع|برمج|API|واجهة برمجة)/i.test(lower)

  if (simpleConversation) {

console.log("[UNIFIED] planner mode");
console.log("[UNIFIED] intent:", cognition?.intent);
console.log("[UNIFIED] prompt:", text);

    return {

      version: "v6-conversation",

      intent: "conversation",

      tasks: [

        {
          id: "assistant_1",
          type: "agent",
          agent: "assistant",
          input: text,
          priority: 10,
          cost: 1,
          estimatedTime: 1
        },

        {
          id: "final_output",
          type: "synthesis",
          priority: 1,
          cost: 1,
          estimatedTime: 1,
          dependsOn: ["assistant_1"]
        }

      ]

    };

  }

  // ================= EVERYTHING ELSE =================

  return {

    version: "v6-planner",

    intent: cognition?.intent || "planning",

    tasks: [

      {
        id: "planner_1",
        type: "agent",
        agent: "planner",
        input: text,
        priority: 10,
        cost: 2,
        estimatedTime: 2
      }

    ]

  };

}
