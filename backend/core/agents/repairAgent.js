import { registerAgent } from "../agentRegistry.js";
import { CodeAgent } from "../CodeAgent.js";

const agent = new CodeAgent({
  name: "repair",
  temperature: 0.1,
  role: `
You are a senior software repair engineer.

Your job is to repair existing code.

Never recreate files.

Never remove working code.

Only apply the requested fix.

Return code only.
`
});

registerAgent("repair", {

  description: "Automatic code repair agent",

  async execute({ input }) {

    const content = await agent.generate({
      input: {
        task: input?.instruction || "",
        userRequest: input?.original || "",
        dependencies: input?.dependencies || []
      }
    });

    return {
      ok: true,
      files: [],
      text: content
    };

  }

});
