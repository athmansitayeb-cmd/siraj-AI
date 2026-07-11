import { groq } from "./groqClient.js";
import { stripMarkdown } from "./utils/stripMarkdown.js";

import {
  publishKnowledge,
  readKnowledge
} from "./sharedWorkspaceBus.js";

import {
  getWorkspaceMemory,
  updateWorkspaceMemory
} from "./workspaceMemory.js";

export class BaseAgent {

  constructor(config = {}) {

    this.name = config.name;

    this.model =
      config.model ||
      "llama-3.3-70b-versatile";

    this.temperature =
      config.temperature ?? 0.2;

    this.systemPrompt =
      config.systemPrompt ||
      config.role ||
      "";

  }

  buildMessages(userContent) {

    return [

      {
        role: "system",
        content: this.systemPrompt
      },

      {
        role: "user",
        content:
          typeof userContent === "string"
            ? userContent
            : JSON.stringify(userContent, null, 2)
      }

    ];

  }

  async ask(userContent) {

    const completion =
      await groq.chat.completions.create({

        model: this.model,

        temperature: this.temperature,

        messages:
          this.buildMessages(userContent)

      });

    return stripMarkdown(
      completion?.choices?.[0]?.message?.content || ""
    );

  }

  async askJSON(userContent, fallback = {}) {

    try {

      const txt =
        await this.ask(userContent);

      return JSON.parse(txt);

    } catch {

      return fallback;

    }

  }

  async readWorkspace(workspaceId) {

    if (!workspaceId)
      return [];

    return await readKnowledge(
      workspaceId
    );

  }

  async workspaceMemory(workspaceId) {

    if (!workspaceId)
      return {};

    return await getWorkspaceMemory(
      workspaceId
    );

  }

  async saveWorkspace(workspaceId, patch = {}) {

    if (!workspaceId)
      return;

    await updateWorkspaceMemory(
      workspaceId,
      patch
    );

  }

  async publish(workspaceId, data) {

    if (!workspaceId)
      return;

    await publishKnowledge(
      workspaceId,
      this.name,
      data
    );

  }

  async remember(workspaceId, patch = {}) {

    await this.saveWorkspace(
      workspaceId,
      patch
    );

    await this.publish(
      workspaceId,
      patch
    );

  }

  log(...args) {

    console.log(
      `[${this.name.toUpperCase()}]`,
      ...args
    );

  }

  error(...args) {

    console.error(
      `[${this.name.toUpperCase()} ERROR]`,
      ...args
    );

  }

}
