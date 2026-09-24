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

Never recreate existing pages.

Never duplicate components.

Reuse existing layout.

Preserve imports.

Return only valid JSX.

Rules:

- React functional component.
- Use hooks when needed.
- Export default.
- No markdown.
- No explanations.
`
});

function normalizePageName(pageInfo) {
  const raw =
    typeof pageInfo === "string"
      ? pageInfo
      : pageInfo?.name ||
        pageInfo?.title ||
        pageInfo?.path?.replace(/^\/+|\/+$/g, "");

  const name = String(raw || "App")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)
    ? name
    : "App";
}

registerAgent("frontend", {

  description: "Frontend code generator",

  async execute({ input, context }) {

    const workspaceVersion =
      context?.workspace?.snapshot?.version || 1;

    const knowledge = context?.workspaceId
      ? await readKnowledge(
          context.workspaceId,
          workspaceVersion
        )
      : [];

const plannerKnowledge =
  [...knowledge]
    .reverse()
    .find(k => k.agent === "planner");

const dependencyResults =
  input?.dependencies
    ?.map(d => d?.result)
    ?.filter(Boolean) || [];

const plannerPlan = plannerKnowledge?.data;

const plan =
  (Array.isArray(plannerPlan?.pages) && plannerPlan.pages.length
    ? plannerPlan
    : null) ||
  dependencyResults.find(d => Array.isArray(d.pages) && d.pages.length) ||
  plannerPlan ||
  dependencyResults.find(d => d.architecture) ||
  {};

let pages = plan.pages || [];

if (!pages.length) {

  const task = (input?.instruction || "").toLowerCase();

  if (task.includes("login")) pages = ["Login"];
  else if (task.includes("dashboard")) pages = ["Dashboard"];
  else if (task.includes("analytics")) pages = ["Analytics"];
  else if (task.includes("admin")) pages = ["Admin"];
  else pages = ["App"];

}

    const files = [];

   for (const pageInfo of pages) {

     const page = normalizePageName(pageInfo);

      const content = await agent.generate({

        workspaceId: context?.workspaceId,

        input: {

          task: input?.instruction || "",

          userRequest: input?.original || "",

          page,

          pages,

          routes: plan.routes || [],

          architecture: plan.architecture || {},

          context

        }

      });

      files.push({

        path: `frontend/src/pages/${page}.jsx`,

content:
  (content && content.trim().length > 50)
    ? content
    : `export default function ${page}(){

return (
<div>${page}</div>
);

}`

      });

    }

return {
  ok: true,
  files,
  pages,
  routes: plan.routes || [],
  entities: plan.entities || []
};

  }

});
