import { registerAgent } from "../agentRegistry.js";
import { readKnowledge } from "../sharedWorkspaceBus.js";
import { CodeAgent } from "../CodeAgent.js";
import { readWorkspaceFile } from "../workspaceFs.js";

const agent = new CodeAgent({
  name: "backend",
  temperature: 0.1,
  role: `
You are a senior Node.js backend architect.

The USER REQUEST is the complete project vision.

The TASK is your current responsibility.

Generate production-ready Express backend.

If an existing server.js is provided:

If existingServer is provided, it is the source of truth.

Update it in-place.

Do NOT generate auth_routes.js.

Do NOT split files.

Do NOT create new files.

Return ONLY the updated backend/server.js.

- NEVER recreate it.
- NEVER delete existing routes.
- ONLY merge the requested changes.
- Preserve every existing endpoint.
- Preserve middleware.
- Preserve imports.

Requirements:

- Express
- REST API
- JSON middleware
- Production-ready
- Return ONLY code
`
});

registerAgent("backend", {

  description: "Backend code generator",

  async execute({ input, context }) {

    const knowledge = context?.workspaceId
      ? await readKnowledge(context.workspaceId)
      : [];

const plannerKnowledge =
  [...knowledge]
    .reverse()
    .find(k => k.agent === "planner");

const plan =
  plannerKnowledge?.data ||
  input?.dependencies
    ?.find(d => d.result?.architecture)
    ?.result ||
  {};

const existingServer =
  context?.workspaceId
    ? await readWorkspaceFile({
        workspaceId: context.workspaceId,
        file: "backend/server.js"
      })
    : "";

    const content = await agent.generate({

      workspaceId: context?.workspaceId,

input: {
  task: input?.instruction || "",

  userRequest: input?.original || "",

  instruction: `
Current server.js:

${existingServer || "No existing server."}

Modify ONLY this file.

Never recreate it.

Never remove existing routes.

Only implement the requested task.

Return the COMPLETE updated server.js.

Never duplicate imports.

Never duplicate middleware.

Never duplicate routes.

If functionality already exists:
extend it instead of recreating it.

Keep formatting clean.

`,

  architecture: plan.architecture || {},

  routes: plan.routes || [],

  entities: plan.entities || []
}

    });

    return {

      ok: true,

      files: [

        {

          path: "backend/server.js",

content:
  (content && content.trim().length > 50)
    ? content
    : `import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req,res)=>{
  res.json({ ok:true });
});

app.listen(3001);
`
        }

      ]

    };

  }

});
