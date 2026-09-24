import { registerAgent } from "./agentRegistry.js";
import { CodeAgent } from "./CodeAgent.js";

export function createCodeAgent(config) {

  const agent = new CodeAgent({
    name: config.name,
    temperature: config.temperature ?? 0.1,
    systemPrompt: config.systemPrompt
  });

  registerAgent(config.name, {

    description: config.description || "",

    async execute({ input, context }) {

      const workspaceVersion =
        context?.workspace?.snapshot?.version || 1;

      const knowledge =
        await agent.readWorkspace(
          context?.workspaceId,
          workspaceVersion
        );

      const latest =
        knowledge.at(-1)?.data || {};

      const plan =
        latest ||
        input?.dependencies?.[0]?.result ||
        {};

      const file =
        await agent.generateFile({

          workspaceId:
            context?.workspaceId,

          workspaceVersion,

          path:
            config.outputPath,

          prompt: JSON.stringify({

            task:
              input?.instruction || "",

            userRequest:
              input?.original || "",

            architecture:
              plan.architecture || {},

            routes:
              plan.routes || [],

            entities:
              plan.entities || [],

            pages:
              plan.pages || []

          }),

          fallback:
            config.fallback || ""

        });

      return {

        ok: true,

        files: [file]

      };

    }

  });

}
