import { registerAgent } from "../agentRegistry.js";
import { BaseAgent } from "../BaseAgent.js";

const agent = new BaseAgent({
  name: "architect",
  temperature: 0.15,
  systemPrompt: `
You are a senior software architect.

Generate a production architecture.

Return JSON only.

{
  "architecture":{},
  "folders":[],
  "modules":[],
  "services":[],
  "database":{},
  "routes":[],
  "pages":[],
  "entities":[]
}
`
});

registerAgent("architect", {

  description: "System architecture designer",

  async execute({ input, context }) {

    const ws = context?.workspaceId;

    const knowledge =
      await agent.readWorkspace(ws);

    const latest =
      knowledge.at(-1)?.data || {};

    const fallback = {

      architecture:
        latest.architecture || {},

      routes:
        latest.routes || [],

      pages:
        latest.pages || [],

      entities:
        latest.entities || [],

      folders: [
        "frontend",
        "backend",
        "database"
      ],

      modules: [
        "auth",
        "users"
      ],

      services: [
        "api"
      ]

    };

    const result =
      await agent.askJSON(

JSON.stringify({

task:
input?.instruction || "",

userRequest:
input?.original || "",

architecture:
fallback.architecture,

routes:
fallback.routes,

pages:
fallback.pages,

entities:
fallback.entities

}),

fallback

);

    await agent.saveWorkspace(
      ws,
      {

        architecture:
          result.architecture,

        routes:
          result.routes,

        pages:
          result.pages,

        entities:
          result.entities,

        folders:
          result.folders,

        modules:
          result.modules,

        services:
          result.services

      }
    );

    await agent.publish(
      ws,
      result
    );

    return {
      ok: true,
      result
    };

  }

});
