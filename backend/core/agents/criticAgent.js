import { registerAgent }
  from "../agentRegistry.js";

import {
  readWorkspaceFile
} from "../workspaceFs.js";

// ================= CRITIC AGENT =================
registerAgent("critic", {

  description:
    "Validates generated files",

  async execute({
    input,
    context
  }) {

    const workspaceId =
      context.workspaceId;

    const problems = [];

    let html = "";
    let css = "";

    // ================= READ FILES =================
    try {

      html =
        await readWorkspaceFile({
          workspaceId,
          file: "frontend/index.html"
        });

    } catch {
      problems.push(
        "Missing index.html"
      );
    }

    try {

      css =
        await readWorkspaceFile({
          workspaceId,
          file: "frontend/style.css"
        });

    } catch {
      problems.push(
        "Missing style.css"
      );
    }

    // ================= HTML CHECKS =================
    if (html) {

      if (!html.includes("<form")) {
        problems.push(
          "No form element"
        );
      }

      if (!html.includes("password")) {
        problems.push(
          "Password input missing"
        );
      }

      if (!html.includes("button")) {
        problems.push(
          "Button missing"
        );
      }

    }

    // ================= CSS CHECKS =================
    if (css) {

      if (css.length < 40) {
        problems.push(
          "CSS too small"
        );
      }

    }

    // ================= RESULT =================
    return {
      ok: problems.length === 0,
      verdict:
        problems.length === 0
          ? "approved"
          : "rejected",
      problems
    };

  }

});
