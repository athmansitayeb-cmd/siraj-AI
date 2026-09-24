import { BaseAgent } from "./BaseAgent.js";
import { readKnowledge } from "./sharedWorkspaceBus.js";

export class CodeAgent extends BaseAgent {

  constructor(config = {}) {
    super(config);

    this.role = config.role || "";
  }

  // ================= CLEAN MODEL OUTPUT =================
  clean(content = "") {

return String(content)
  .replace(/^```[a-zA-Z]*\s*/i, "")
  .replace(/\s*```$/i, "")
  .trim();

  }

  // ================= BUILD PROMPT =================
  async buildPrompt(workspaceId, input, context = {}) {

    let latestPlan = {};
    let workspaceKnowledge = [];

    const workspaceVersion =
      context.workspace?.snapshot?.version || 1;

    if (workspaceId) {

      try {

        const knowledge =
          await readKnowledge(
            workspaceId,
            workspaceVersion
          );

        workspaceKnowledge = knowledge;

const plannerKnowledge =
  [...knowledge]
    .reverse()
    .find(k => k.agent === "planner");

latestPlan =
  plannerKnowledge?.data || {};

      } catch {}

    }

    return [
      {
        role: "system",
        content: this.role
      },
      {
        role: "user",
content: JSON.stringify({

  task: input,

  planner: latestPlan,

  workspaceFiles:
    context.workspace?.files || [],

  sharedKnowledge:
    workspaceKnowledge,

  agent:
    context.agentMeta || {},

  previousRuns:
    context.agentMemory || {}

}, null, 2)
      }
    ];

  }

  // ================= GENERATE =================
  async generate({
    workspaceId,
    input
  }) {

    const prompt =
      await this.buildPrompt(
        workspaceId,
        input,
        input.context || {}
      );

const content = await super.ask(prompt);

const cleaned = this.clean(content);

return cleaned.length ? cleaned : "";

  }

  // ================= GENERATE FILE =================
  async generateFile({

    prompt,
    path,
    fallback = "",
    workspaceId,
    workspaceVersion = 1

  }) {

    let content = fallback;

    try {

      if (!prompt) {

        content =
          await this.generate({
            workspaceId,
            input: {
              file: path
            }
          });

      } else {

        const result =
          await super.ask(prompt);

        content =
          this.clean(result);

      }

    } catch {

      content = fallback;

    }

    if (workspaceId) {

      try {

        await this.publish(
          workspaceId,
          {
            generated: path,
            ts: Date.now()
          },
          workspaceVersion
        );

      } catch {}

    }

    return {
      path,
      content
    };

  }

  // ================= PARALLEL FILE GENERATION =================
  async generateFiles(files = []) {

    return Promise.all(

      files.map(file =>
        this.generateFile(file)
      )

    );

  }

}
