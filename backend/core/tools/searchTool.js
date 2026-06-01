import { registerTool } from "../toolRegistry.js";

registerTool("search", {
  description: "Search capability",
  risk: "low",

  async execute(input) {

    return {
      ok: true,
      result: `Search completed for: ${input}`
    };

  }
});
