import { registerAgent } from "../agentRegistry.js";
import { readKnowledge } from "../sharedWorkspaceBus.js";
import { CodeAgent } from "../CodeAgent.js";

const agent = new CodeAgent({
  name: "backend",
  temperature: 0.1,
  role: `
You are a senior Node.js backend architect.

The USER REQUEST is the complete project vision.

The TASK is your current responsibility.

Generate production-ready Express backend.

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

    const latest = knowledge.at(-1)?.data || {};

    const plan =
      latest ||
      input?.dependencies?.[0]?.result ||
      {};

    const content = await agent.generate({

      workspaceId: context?.workspaceId,

      input: {

        task: input?.instruction || "",

        userRequest: input?.original || "",

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
            content ||
`import express from "express";

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
