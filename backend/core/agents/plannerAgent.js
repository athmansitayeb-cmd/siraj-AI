import { registerAgent } from "../agentRegistry.js";
import { groq } from "../groqClient.js";
import { updateWorkspaceMemory } from "../workspaceMemory.js";
import { publishKnowledge } from "../sharedWorkspaceBus.js";

registerAgent("planner", {

  description: "Core planning brain (LLM + structured task generator)",

  async execute({ input, context }) {

const originalPrompt = String(
  input?.original || ""
);

const instruction = String(
  input?.instruction || ""
);

const msg = originalPrompt || instruction;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `
You are the MASTER PLANNER of SIRAJ.

Your job is NOT to answer the user.

Your ONLY responsibility is to transform the user's request into an optimal execution graph for the runtime engine.

Return ONLY valid JSON.

Never use markdown.

Never explain anything.

Never return natural language.

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

{
  "intent": "",
  "complexity": "low|medium|high",
  "estimatedTasks": 0,
  "architecture": {},
  "routes": [],
  "pages": [],
  "entities": [],
  "tasks":[]
}

--------------------------------------------------
YOUR GOALS
--------------------------------------------------

Your goal is to minimize execution time while maximizing quality.

Think like a software architect.

Break large problems into smaller independent tasks.

Parallelize whenever possible.

Never create unnecessary tasks.

--------------------------------------------------
AVAILABLE AGENTS
--------------------------------------------------

planner

research

architect

frontend

backend

database

api

auth

ui

testing

security

optimizer

documentation

deployment

critic

repair

If an agent does not exist yet, still include it if it logically belongs to the execution graph.

--------------------------------------------------
TASK FORMAT
--------------------------------------------------

Each task MUST be

{
"id":"task_name",
"type":"agent",
"agent":"backend",
"input":"clear instruction",
"dependsOn":[]
}

Allowed types

agent

tool

synthesis

--------------------------------------------------
TASK IDS
--------------------------------------------------

IDs must be unique.

Examples

research_1

backend_api

backend_models

frontend_dashboard

frontend_login

database_schema

testing_api

critic_review

repair_backend

final_output

--------------------------------------------------
DEPENDENCIES
--------------------------------------------------

Use dependsOn to create a DAG.

Never create cycles.

Independent tasks should execute in parallel.

Example

research

↓

architecture

↓

database
backend
frontend

↓

testing

↓

critic

↓

repair

↓

final

--------------------------------------------------
WHEN TO CREATE TASKS
--------------------------------------------------

Small question

↓

assistant only

Simple generation

↓

research

↓

critic

↓

final

Medium software

↓

research

↓

architecture

↓

frontend

↓

backend

↓

critic

↓

final

Large software

↓

research

↓

architecture

↓

database

↓

backend

↓

frontend

↓

authentication

↓

api

↓

testing

↓

security

↓

optimization

↓

documentation

↓

deployment

↓

critic

↓

repair

↓

final

--------------------------------------------------
ARCHITECTURE
--------------------------------------------------

Infer automatically

frontend

backend

database

authentication

api

mobile

desktop

ai

agents

--------------------------------------------------
ROUTES
--------------------------------------------------

Extract all API routes.

--------------------------------------------------
PAGES
--------------------------------------------------

Extract UI pages.

--------------------------------------------------
ENTITIES
--------------------------------------------------

Extract business entities.

--------------------------------------------------
QUALITY RULES
--------------------------------------------------

Never duplicate work.

Never merge unrelated tasks.

Split large backend work into multiple tasks.

Split frontend into pages when needed.

Create testing tasks whenever code is generated.

Always perform critic review before final synthesis.

If the project is large,

insert repair tasks after critic.

--------------------------------------------------
SYNTHESIS
--------------------------------------------------

Always finish with

{
"id":"final_output",
"type":"synthesis",
"dependsOn":[
"...last tasks..."
]
}

--------------------------------------------------
JSON ONLY
--------------------------------------------------

Return ONLY valid JSON.

No markdown.

No comments.

No explanations.

No prose.
          `
        },
        {
          role: "user",
          content: msg
        }
      ]
    });

    let text = completion?.choices?.[0]?.message?.content || "{}";

    try {
const plan = JSON.parse(text);
if (context?.workspaceId) {

  await updateWorkspaceMemory(context.workspaceId, {

    architecture: plan.architecture || {},

    routes: plan.routes || [],

    pages: plan.pages || [],

    entities: plan.entities || [],

    originalRequest: msg,

    intent: plan.intent || "",

    complexity: plan.complexity || "medium"

  });

  await publishKnowledge(
    context.workspaceId,
    "planner",
    plan
  );
}

return {
  ok: true,
  intent: plan.intent,
  complexity: plan.complexity,
  architecture: plan.architecture,
  routes: plan.routes || [],
  pages: plan.pages || [],
  entities: plan.entities || [],
  tasks: plan.tasks || []
};
} catch (e) {

  console.error(
    "[PLANNER ERROR]",
    e
  );

  console.error(
    "[PLANNER RAW]",
    text
  );

  return {
    ok: false,
    error: e.message,
    raw: text
  };

}
  }
});
