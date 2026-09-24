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

const workspaceVersion =
  context?.workspace?.snapshot?.version || 1;

const knowledge =
  await agent.readWorkspace(ws, workspaceVersion);

const plannerKnowledge =
  [...knowledge]
    .reverse()
    .find(k => k.agent === "planner");

const latest =
  plannerKnowledge?.data ||
  (knowledge.length
    ? knowledge[knowledge.length - 1].data
    : {});

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

const safe = {
  architecture: result?.architecture || fallback.architecture,
  routes: result?.routes || fallback.routes,
  pages: result?.pages || fallback.pages,
  entities: result?.entities || fallback.entities,
  folders: result?.folders || fallback.folders,
  modules: result?.modules || fallback.modules,
  services: result?.services || fallback.services
};

    await agent.saveWorkspace(
      ws,
      {

architecture: safe.architecture,
routes: safe.routes,
pages: safe.pages,
entities: safe.entities,
folders: safe.folders,
modules: safe.modules,
services: safe.services

      },
      workspaceVersion
    );

    await agent.publish(
      ws,
      safe,
      workspaceVersion
    );

    return {
      ok: true,
      result: safe
    };

  }

});
