import { BaseAgent } from "./BaseAgent.js";

export class CodeAgent extends BaseAgent {

  constructor(config = {}) {
    super(config);
    this.role = config.role || "";
  }

  async generate({ workspaceId, input }) {

    const prompt = [
      {
        role: "system",
        content: this.role
      },
      {
        role: "user",
        content: JSON.stringify(input, null, 2)
      }
    ];

    return await this.ask(prompt);

  }

  async generateFile({

    prompt,
    path,
    fallback = "",
    workspaceId

  }) {

    let content = fallback;

    try {

      content = await this.ask(prompt);

    } catch {

      content = fallback;

    }

    await this.publish(
      workspaceId,
      {
        generated: path
      }
    );

    return {
      path,
      content
    };

  }

  async generateFiles(files = []) {

    const output = [];

    for (const file of files) {

      output.push(
        await this.generateFile(file)
      );

    }

    return output;

  }

}
