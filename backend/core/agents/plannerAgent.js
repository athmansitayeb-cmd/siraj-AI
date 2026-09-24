import {
  registerAgent,
  listAgents
} from "../agentRegistry.js";

import { groq } from "../groqClient.js";
import { updateWorkspaceMemory } from "../workspaceMemory.js";
import { publishKnowledge } from "../sharedWorkspaceBus.js";

const ALLOWED_TYPES = new Set([
  "agent",
  "tool",
  "synthesis"
]);

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeTask(task) {
  if (!task || typeof task !== "object") {
    return null;
  }

  const id = normalizeText(task.id);
  const agent = normalizeText(task.agent);
  const type = normalizeText(task.type || "agent");

  if (!id || !agent) {
    return null;
  }

  if (!ALLOWED_TYPES.has(type)) {
    return null;
  }

  return {
    ...task,

    id,

    type,

    agent,

    input: normalizeText(task.input),

    priority:
      Number.isFinite(Number(task.priority))
        ? Number(task.priority)
        : 5,

    cost:
      Number.isFinite(Number(task.cost))
        ? Number(task.cost)
        : 1,

    estimatedTime:
      Number.isFinite(Number(task.estimatedTime))
        ? Number(task.estimatedTime)
        : 1,

    dependsOn:
      Array.isArray(task.dependsOn)
        ? task.dependsOn
            .map(normalizeText)
            .filter(Boolean)
        : []
  };
}

function deduplicateTasks(tasks, existingTaskIds) {

  const seenIds = new Set(existingTaskIds);

  const seenWork = new Set();

  const result = [];

  for (const rawTask of tasks || []) {

    const task = normalizeTask(rawTask);

    if (!task) {
      continue;
    }

    /*
     * Existing graph tasks must never be recreated.
     */
    if (seenIds.has(task.id)) {
      continue;
    }

    /*
     * Never allow duplicate work with different IDs.
     */
    const workKey =
      `${task.type}:${task.agent}:${task.input}`
        .toLowerCase()
        .trim();

    if (seenWork.has(workKey)) {
      continue;
    }

    seenIds.add(task.id);
    seenWork.add(workKey);

    result.push(task);
  }

  return result;
}

function sanitizeDependencies(tasks, existingTaskIds) {

  const validIds = new Set([
    ...existingTaskIds,
    ...tasks.map(task => task.id)
  ]);

  for (const task of tasks) {

    task.dependsOn = [
      ...new Set(
        task.dependsOn.filter(dep =>
          validIds.has(dep) &&
          dep !== task.id
        )
      )
    ];
  }

  return tasks;
}

function ensureFinalTask(tasks, repairMode = false) {

  /*
   * Repair mode must NEVER create a new final task.
   * The runtime already owns final_output.
   */
  if (repairMode) {
    return tasks.filter(
      task =>
        task.type !== "synthesis" &&
        task.id !== "final_output"
    );
  }

  /*
   * Remove any LLM-generated final tasks.
   * We create exactly one deterministic final task.
   */
  const filtered = tasks.filter(
    task =>
      task.type !== "synthesis" &&
      task.id !== "final_output"
  );

  const criticTasks = filtered.filter(
    task => task.agent === "critic"
  );

  /*
   * Final depends on critic when critic exists.
   * Otherwise it depends on the last generated tasks.
   */
  let dependencies;

  if (criticTasks.length) {

    dependencies = criticTasks.map(
      task => task.id
    );

  } else {

    const dependedOn = new Set(
      filtered.flatMap(
        task => task.dependsOn || []
      )
    );

    dependencies = filtered
      .filter(task => !dependedOn.has(task.id))
      .map(task => task.id);
  }

  filtered.push({
    id: "final_output",
    type: "synthesis",
    agent: "synthesis",
    input: "Synthesize final workspace output",
    priority: 1,
    cost: 1,
    estimatedTime: 1,
    dependsOn: dependencies
  });

  return filtered;
}

registerAgent("planner", {

  description:
    "Core planning brain (LLM + structured task generator)",

  async execute({ input, context }) {

    const originalPrompt =
      normalizeText(input?.original);

    const instruction =
      normalizeText(input?.instruction);

    const critic =
      input?.critic || null;

    const currentGraph =
      input?.graph || null;

    const workspaceId =
      context?.workspaceId;

    const workspaceVersion =
      context?.workspace?.snapshot?.version || 1;

    const existingTaskIds =
      new Set(
        Object.keys(
          currentGraph?.nodes || {}
        )
      );

    const repairMode =
      instruction === "Repair execution graph";

    const availableAgents =
      listAgents();

    const availableAgentSet =
      new Set(availableAgents);

    const userRequest =
      originalPrompt || instruction;

    /*
     * Initial planning and repair planning are deliberately
     * separated. This prevents the LLM from rebuilding the
     * entire project during repair.
     */
    const systemPrompt = `
You are the MASTER PLANNER of SIRAJ.

Your responsibility is to generate an execution graph.

AVAILABLE AGENTS:
${availableAgents.join("\n")}

Only use agents from this exact list.

Never invent an agent.

==================================================
MODE
==================================================

${repairMode
  ? `
REPAIR MODE

The project has already been executed.

The critic found problems.

Analyze:
- the original user request
- the critic issues
- the current graph

Return ONLY NEW repair tasks.

Rules:

1. Never recreate completed tasks.
2. Never recreate successful work.
3. Never create final_output.
4. Never create synthesis tasks.
5. Never create another critic task.
6. Create only tasks necessary to fix the reported issues.
7. Use the correct agent for each issue.
8. Keep repair tasks independent whenever possible.
9. Do not modify unrelated functionality.
`
  : `
INITIAL PLANNING MODE

Transform the complete user request into an execution graph.

Create only tasks actually required.

The planner itself is already running.
Do not generate any task whose agent is "planner".

Use parallel tasks whenever dependencies allow it.

Always include a critic task when software/code is generated.

Do not create final_output.
The runtime will add it deterministically.
==================================================
STRICT JSON OUTPUT
==================================================

Return exactly ONE JSON object.

The response MUST start with "{"
and MUST end with "}".

NEVER return multiple JSON objects.

NEVER return raw task objects.

NEVER return a JSON array as the top-level response.

ALL tasks MUST be inside the "tasks" array.

Correct structure:

{
  "intent": "software",
  "complexity": "medium",
  "architecture": {},
  "routes": [],
  "pages": [],
  "entities": [],
  "tasks": [
    {
      "id": "task_1",
      "type": "agent",
      "agent": "architect",
      "input": "Design the architecture",
      "priority": 5,
      "cost": 2,
      "estimatedTime": 2,
      "dependsOn": []
    }
  ]
}

Return JSON only.
No markdown.
No explanation.
`}

==================================================
TASK FORMAT
==================================================

{
  "id": "unique_task_id",
  "type": "agent",
  "agent": "registered_agent",
  "input": "clear executable instruction",
  "priority": 5,
  "cost": 1,
  "estimatedTime": 1,
  "dependsOn": []
}

==================================================
QUALITY RULES
==================================================

- Never duplicate work.
- Never invent agents.
- Never create cycles.
- Keep tasks focused.
- Backend changes belong to backend or repair.
- Frontend changes belong to frontend or repair.
- Architecture decisions belong to architect.
- Project analysis belongs to research.
- General planning belongs to planner.
- Never create a task assigned to planner during initial planning.
- The planner is already executing the master planning phase.
- Never create planner -> planner recursive tasks.
- Code defects can use repair.
- Critic is for review only.
- Synthesis is controlled by the runtime.
`;

    const userPayload =
      repairMode
        ? {
            mode: "repair",
            originalRequest: originalPrompt,
            critic,
            currentGraph
          }
        : {
            mode: "initial",
            originalRequest: userRequest
          };

    let completion;

    try {

      completion =
        await groq.chat.completions.create({

          model:
            process.env.GROQ_MODEL || "openai/gpt-oss-120b",

          temperature: 0.15,

          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content:
                JSON.stringify(
                  userPayload,
                  null,
                  2
                )
            }
          ]
        });

    } catch (error) {

      console.error(
        "[PLANNER GROQ ERROR]",
        error
      );

      return {
        ok: false,
        error:
          error?.message ||
          "planner_llm_failed",
        tasks: []
      };
    }

    let text =
      completion
        ?.choices?.[0]
        ?.message?.content || "{}";

    // ==================================================
    // ROBUST PLANNER JSON PARSER
    // ==================================================

    let clean =
      String(text).trim();

    /*
     * Remove markdown fences.
     */
    clean = clean
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    function extractJSONValues(source) {

      const values = [];

      let start = -1;
      let depth = 0;
      let inString = false;
      let escaped = false;

      for (
        let i = 0;
        i < source.length;
        i++
      ) {

        const char = source[i];

        if (inString) {

          if (escaped) {
            escaped = false;
            continue;
          }

          if (char === "\\") {
            escaped = true;
            continue;
          }

          if (char === '"') {
            inString = false;
          }

          continue;
        }

        if (char === '"') {
          inString = true;
          continue;
        }

        if (
          char === "{" ||
          char === "["
        ) {

          if (depth === 0) {
            start = i;
          }

          depth++;

          continue;
        }

        if (
          char === "}" ||
          char === "]"
        ) {

          depth--;

          if (
            depth === 0 &&
            start !== -1
          ) {

            const candidate =
              source.slice(
                start,
                i + 1
              );

            try {

              values.push(
                JSON.parse(candidate)
              );

            } catch {
              // Ignore invalid fragment
            }

            start = -1;
          }
        }
      }

      return values;
    }

    let plan;

    try {

      /*
       * First attempt:
       * normal JSON object.
       */
      try {

        plan =
          JSON.parse(clean);

      } catch {

        /*
         * Second attempt:
         * extract balanced JSON values.
         */
        const values =
          extractJSONValues(clean);

        /*
         * Standard planner object.
         */
        if (
          values.length === 1 &&
          values[0] &&
          typeof values[0] === "object" &&
          !Array.isArray(values[0])
        ) {

          const value = values[0];

          if (
            Array.isArray(value.tasks)
          ) {

            plan = value;

          } else if (
            value.id &&
            value.agent
          ) {

            /*
             * Single task returned
             * instead of full plan.
             */
            plan = {
              intent: "software",
              complexity: "medium",
              architecture: {},
              routes: [],
              pages: [],
              entities: [],
              tasks: [value]
            };
          }
        }

        /*
         * LLM sometimes returns:
         *
         * {...},
         * {...},
         * {...}
         *
         * Convert those objects
         * into plan.tasks.
         */
        if (
          !plan &&
          values.length > 0 &&
          values.every(
            value =>
              value &&
              typeof value === "object" &&
              !Array.isArray(value) &&
              value.id &&
              value.agent
          )
        ) {

          plan = {

            intent: "software",

            complexity: "medium",

            architecture: {},

            routes: [],

            pages: [],

            entities: [],

            tasks: values
          };
        }

        /*
         * LLM may return:
         *
         * [
         *   {...},
         *   {...}
         * ]
         */
        if (
          !plan &&
          values.length === 1 &&
          Array.isArray(values[0])
        ) {

          const tasks =
            values[0];

          plan = {

            intent: "software",

            complexity: "medium",

            architecture: {},

            routes: [],

            pages: [],

            entities: [],

            tasks
          };
        }
      }

      if (
        !plan ||
        typeof plan !== "object"
      ) {

        throw new Error(
          "Planner returned no valid JSON plan"
        );
      }

      if (
        !Array.isArray(plan.tasks)
      ) {

        plan.tasks = [];
      }

      console.log(
        "[PLANNER JSON PARSED]",
        {
          tasks:
            plan.tasks.length
        }
      );

    } catch (error) {

      console.error(
        "[PLANNER JSON ERROR]",
        error
      );

      console.error(
        "[PLANNER RAW]",
        clean
      );

      return {

        ok: false,

        error:
          "invalid_planner_json",

        tasks: [],

        files: []
      };
    }

    /*
     * Normalize metadata.
     */
    plan.intent =
      normalizeText(plan.intent);

    plan.complexity =
      ["low", "medium", "high"]
        .includes(plan.complexity)
        ? plan.complexity
        : "medium";

    plan.architecture =
      plan.architecture &&
      typeof plan.architecture === "object"
        ? plan.architecture
        : {};

    plan.routes =
      Array.isArray(plan.routes)
        ? plan.routes
        : [];

    plan.pages =
      Array.isArray(plan.pages)
        ? plan.pages
        : [];

    plan.entities =
      Array.isArray(plan.entities)
        ? plan.entities
        : [];

    /*
     * Validate and deduplicate tasks.
     */
    let tasks =
      deduplicateTasks(
        Array.isArray(plan.tasks)
          ? plan.tasks
          : [],
        existingTaskIds
      );

    /*
     * Only registered agents are allowed.
     */

tasks =
  tasks.filter(task => {

    if (
      task.type === "synthesis"
    ) {
      return false;
    }

    if (
      task.agent === "planner"
    ) {
      console.warn(
        "[PLANNER RECURSION BLOCKED]",
        task.id
      );

      return false;
    }

    if (
      !availableAgentSet.has(
        task.agent
      )
    ) {

          console.warn(
            "[PLANNER INVALID AGENT]",
            task.agent,
            task.id
          );

          return false;
        }

        return true;
      });

    /*
     * Repair mode has strict rules.
     */
    if (repairMode) {

      tasks =
        tasks.filter(task => {

          if (
            task.id === "final_output"
          ) {
            return false;
          }

          if (
            task.type === "synthesis"
          ) {
            return false;
          }

          if (
            task.agent === "critic"
          ) {
            return false;
          }

          return true;
        });
    }

    /*
     * Clean dependencies.
     */
    tasks =
      sanitizeDependencies(
        tasks,
        existingTaskIds
      );

    /*
     * Initial planning gets exactly one
     * deterministic final task.
     */
    if (!repairMode) {

      tasks =
        ensureFinalTask(
          tasks,
          false
        );

    } else {

      tasks =
        ensureFinalTask(
          tasks,
          true
        );
    }

    /*
     * Persist planning metadata.
     */
    if (workspaceId) {

      await updateWorkspaceMemory(
        workspaceId,
        {
          workspaceVersion,
          architecture:
            plan.architecture,

          routes:
            plan.routes,

          pages:
            plan.pages,

          entities:
            plan.entities,

          originalRequest:
            originalPrompt ||
            context?.originalPrompt ||
            instruction,

          intent:
            plan.intent,

          complexity:
            plan.complexity
        }
      );

      /*
       * Do not publish a repair plan as if it
       * were the complete original plan.
       */
      await publishKnowledge(
        workspaceId,
        "planner",
        {
          ...plan,
          tasks,
          mode:
            repairMode
              ? "repair"
              : "initial"
        },
        workspaceVersion
      );
    }

    console.log(
      "[PLANNER]",
      {
        mode:
          repairMode
            ? "repair"
            : "initial",

        tasks:
          tasks.map(task => ({
            id: task.id,
            type: task.type,
            agent: task.agent,
            dependsOn:
              task.dependsOn
          }))
      }
    );

    return {

      ok: true,

      intent:
        plan.intent,

      complexity:
        plan.complexity,

      architecture:
        plan.architecture,

      routes:
        plan.routes,

      pages:
        plan.pages,

      entities:
        plan.entities,

      tasks
    };
  }
});
