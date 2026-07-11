import { registerAgent } from "../agentRegistry.js";
import { readKnowledge } from "../sharedWorkspaceBus.js";
import { CodeAgent } from "../CodeAgent.js";

const agent = new CodeAgent({
  name: "frontend",
  temperature: 0.1,
  role: `
You are a senior React architect.

The USER REQUEST is the complete project vision.

The TASK is your current responsibility.

Generate ONLY the requested page.

Rules:

- React functional component.
- Use hooks when needed.
- Export default.
- No markdown.
- No explanations.
`
});

registerAgent("frontend", {

  description: "Frontend code generator",

  async execute({ input, context }) {

    const knowledge = context?.workspaceId
      ? await readKnowledge(context.workspaceId)
      : [];

    const latest = knowledge.at(-1)?.data || {};

    const plan =
      latest ||
      input?.dependencies?.[0]?.result ||
      {};

    const pages =
      plan.pages?.length
        ? plan.pages
        : ["App"];

    const files = [];

    for (const page of pages) {

      const content = await agent.generate({

        workspaceId: context?.workspaceId,

        input: {

          task: input?.instruction || "",

          userRequest: input?.original || "",

          page,

          pages,

          routes: plan.routes || [],

          architecture: plan.architecture || {}

        }

      });

      files.push({

        path: `frontend/src/pages/${page}.jsx`,

        content: content || `export default function ${page}(){

return (
<div>${page}</div>
);

}`

      });

    }

    return {
      ok: true,
      files
    };

  }

});
