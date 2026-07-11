import { registerAgent } from "../agentRegistry.js";
import { BaseAgent } from "../BaseAgent.js";

const agent = new BaseAgent({
  name: "research",
  temperature: 0.2,
  systemPrompt: `
You are a senior software architect.

The user request is the source of truth.

The TASK tells you what your role is.

Always analyze the USER REQUEST, not only the TASK.

Return ONLY valid JSON.

Schema:

{
  "architecture": {
    "projectType": "",
    "frontend": {
      "framework": ""
    },
    "backend": {
      "framework": "",
      "auth": ""
    },
    "database": {
      "engine": ""
    }
  },

  "routes": [],
  "pages": [],
  "entities": []
}

No markdown.
No explanations.
`
});

registerAgent("research", {

  description: "Deterministic software architect",

  async execute({ input, context }) {

    const originalPrompt = String(input?.original || "");
    const instruction = String(input?.instruction || "");

    const prompt = `
TASK:
${instruction}

USER REQUEST:
${originalPrompt}
`;

    const fallback = {
      architecture: {
        projectType: "web-app",
        frontend: { framework: "react" },
        backend: {
          framework: "express",
          auth: "jwt"
        },
        database: {
          engine: "mongodb"
        }
      },
      routes: [
        "/api/auth/login"
      ],
      pages: [
        "Login"
      ],
      entities: [
        "User"
      ]
    };

    const result =
      await agent.askJSON(
        prompt,
        fallback
      );

    await agent.saveWorkspace(
      context?.workspaceId,
      {
        architecture:
          result.architecture || {},
        routes:
          result.routes || [],
        pages:
          result.pages || [],
        entities:
          result.entities || []
      }
    );

    await agent.publish(
      context?.workspaceId,
      result
    );

    return {
      ok: true,
      result
    };

  }

});
