import { registerAgent } from "../agentRegistry.js";

// ================= RESEARCH AGENT =================
registerAgent("research", {

  description: "Research and information gathering",

  async execute({ input }) {

    return {
      ok: true,
      findings: [
        `Research result for: ${input}`
      ]
    };

  }

});
