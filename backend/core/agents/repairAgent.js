import { registerAgent } from "../agentRegistry.js";
import { CodeAgent } from "../CodeAgent.js";
import {
  readWorkspaceFile
} from "../workspaceFs.js";

const agent = new CodeAgent({
  name: "repair",
  temperature: 0.1,
  role: `
You are a senior software repair engineer.

Repair existing code.

Never recreate files.

Never remove working code.

Only modify what the task asks.

Return ONLY the full updated file.
`
});

registerAgent("repair", {

  description: "Automatic code repair agent",

  async execute({ input, context }) {

    const workspaceId = context?.workspaceId;

    const targetFile =
      input?.file ||
      input?.targetFile ||
      "backend/server.js";

    const current =
      workspaceId
        ? await readWorkspaceFile({
            workspaceId,
            file: targetFile
          })
        : "";

    const repaired = await agent.generate({

      workspaceId,

      input: {
        task: input?.instruction || "",
        userRequest: input?.original || "",

        currentFile: current || "",

        dependencies: input?.dependencies || []
      }

    });

    return {

      ok: true,

      files: [

        {

          path: targetFile,

          content:
            repaired && repaired.trim().length > 50
              ? repaired
              : current

        }

      ]

    };

  }

});
