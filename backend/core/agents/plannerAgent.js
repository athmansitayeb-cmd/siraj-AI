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

const critic = input?.critic || null;

const currentGraph = input?.graph || null;

const existingTaskIds = new Set(
  Object.keys(currentGraph?.nodes || {})
);

const repairMode =
  instruction === "Repair execution graph";

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

The planner has TWO modes.

MODE 1
Initial planning.

Create the execution graph from the user's request.

MODE 2
Repair planning.

If critic data and the current graph are provided:

- Analyze the current graph.
- Keep completed tasks.
- Never recreate successful tasks.
- Create ONLY the additional repair tasks required.
- Return ONLY the new tasks that should be appended.

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
  "pages": [
    {
      "name": "",
      "route": ""
    }
  ],
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

"priority":5,
"cost":1,
"estimatedTime":1,

"dependsOn":[]
}

--------------------------------------------------
TASK PRIORITY
--------------------------------------------------

priority

10 = planner

9 = architect

8 = database

8 = backend

8 = frontend

7 = api

7 = auth

6 = testing

5 = security

4 = documentation

3 = deployment

2 = critic

1 = synthesis

--------------------------------------------------
TASK COST
--------------------------------------------------

Estimate relative execution cost.

1 = tiny

3 = small

5 = medium

8 = large

13 = huge

--------------------------------------------------
ESTIMATED TIME
--------------------------------------------------

Estimate execution duration in seconds.


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

Return page objects.

Example

"pages":[
  {
    "name":"Login",
    "route":"/api/auth"
  },
  {
    "name":"Dashboard",
    "route":"/api/dashboard"
  },
  {
    "name":"Analytics",
    "route":"/api/analytics"
  }
]

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
  content: repairMode
    ? JSON.stringify({
        originalRequest: originalPrompt,
        critic,
        graph: currentGraph
      }, null, 2)
    : msg
}
      ]
    });
console.log("===== GROQ COMPLETION =====");
console.dir(completion, { depth: null });

let text = completion?.choices?.[0]?.message?.content || "{}";

console.log("===== RAW TEXT =====");
console.log(text);

// تنظيف أي Markdown يضيفه الـ LLM
let clean = text.trim();

clean = clean.replace(/^```json\s*/i, "");
clean = clean.replace(/^```\s*/i, "");
clean = clean.replace(/```$/i, "").trim();

// استخراج أول JSON صالح
const start = clean.indexOf("{");
const end = clean.lastIndexOf("}");

if (start !== -1 && end !== -1) {
  clean = clean.slice(start, end + 1);
}

console.log("===== CLEAN JSON =====");
console.log(clean);

try {

const plan = JSON.parse(clean);

plan.tasks ??= [];
plan.routes ??= [];
plan.pages ??= [];
plan.entities ??= [];
plan.architecture ??= {};

if (Array.isArray(plan.tasks)) {

plan.tasks = plan.tasks.filter(task => {

  if (!task?.id || !task?.agent) {
    return false;
  }

  if (existingTaskIds.has(task.id)) {
    return false;
  }

  return true;

});

const seen = new Set();

plan.tasks = plan.tasks.filter(task => {

  const key = `${task.agent}:${task.input}`;

  if (seen.has(key)) {
    return false;
  }

  seen.add(key);

  return true;

});

}

for (const task of plan.tasks || []) {

  task.dependsOn ??= [];

}

const validIds = new Set(
  (plan.tasks || []).map(t => t.id)
);

for (const task of plan.tasks) {

  task.dependsOn = task.dependsOn.filter(
    dep =>
      existingTaskIds.has(dep) ||
      validIds.has(dep)
  );

}

for (const task of plan.tasks || []) {

  task.type ??= "agent";

}

for (const task of plan.tasks || []) {

  task.priority ??= 5;
  task.cost ??= 1;
  task.estimatedTime ??= 1;

}

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

if (!plan.tasks.some(t => t.type === "synthesis")) {

  plan.tasks.push({
    id: "final_output",
    type: "synthesis",
    dependsOn: plan.tasks
      .filter(t => t.agent === "critic")
      .map(t => t.id)
  });

}

return {
  ok: true,
  intent: plan.intent,
  complexity: plan.complexity,
  architecture: plan.architecture,
  routes: plan.routes || [],
  pages: plan.pages || [],
  entities: plan.entities || [],
  tasks: Array.isArray(plan.tasks)
    ? plan.tasks
    : []
};
} catch (e) {

  console.error(
    "[PLANNER ERROR]",
    e
  );

  console.error(
    "[PLANNER RAW]",
    clean
  );

  return {
    ok: false,
    error: e.message,
    raw: text
  };

}
  }
});
