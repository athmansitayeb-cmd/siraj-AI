import { registerTool } from "../toolRegistry.js";

registerTool("codegen", {
  description: "Code generation",
  risk: "medium",

  async execute(input) {

    return {
      ok: true,
      result: `Code generated for: ${input}`
    };

  }
});
