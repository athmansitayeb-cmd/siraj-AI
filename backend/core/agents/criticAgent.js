import { registerAgent } from "../agentRegistry.js";
import {
  readWorkspaceFile,
  listWorkspaceFiles
} from "../workspaceFs.js";
import { getWorkspaceMemory } from "../workspaceMemory.js";
import { readKnowledge } from "../sharedWorkspaceBus.js";

registerAgent("critic", {

  async execute({ context }) {

    const ws = context?.workspaceId;

    if (!ws) {
      return {
        ok: false,
        verdict: "rejected",
        repair: false,
        problems: [{ type: "missing_workspace", severity: "critical" }]
      };
    }

    const memory = await getWorkspaceMemory(ws);
    const bus = await readKnowledge(ws);
    const latestPlan = bus[bus.length - 1]?.data;

const originalRequest =
  memory?.originalRequest ||
  latestPlan?.originalRequest ||
  "";

const workspaceFiles =
  await listWorkspaceFiles(ws);

const allFiles =
  workspaceFiles.join("\n");

const frontendFiles = workspaceFiles
  .filter(f =>
    f.startsWith("frontend/") &&
    f.endsWith(".jsx")
  );

let frontend = "";

for (const file of frontendFiles) {

  const content = await readWorkspaceFile({
    workspaceId: ws,
    file
  });

  frontend += "\n" + (content || "");

}

    const backend = await readWorkspaceFile({
      workspaceId: ws,
      file: "backend/server.js"
    });

    const issues = [];

    const addIssue = (type, severity = "medium", fix = null, meta = {}) => {
      issues.push({ type, severity, fix, meta });
    };

    // ================= FILE CHECKS =================
    if (!frontendFiles.length) {
      addIssue(
        "missing_frontend_login",
        "critical",
        "CREATE frontend Login.jsx page"
      );
    }

    if (!backend) {
      addIssue(
        "missing_backend_server",
        "critical",
        "CREATE Express server.js with auth route"
      );
    }

const pages = [
  ...(memory?.pages || []),
  ...(latestPlan?.pages || [])
]
.filter(Boolean)
.filter((v, i, a) => a.indexOf(v) === i);

for (const page of pages) {

const exists = workspaceFiles.some(file =>
  file.endsWith(`/${page}.jsx`)
);

if (!exists) {

    addIssue(
      "missing_page",
      "high",
      `Generate page ${page}`
    );

  }

}

    // ================= REACT CHECK =================
    if (frontend && !frontend.includes("useState")) {
      addIssue(
        "frontend_not_reactive",
        "low",
        "Add React state hooks"
      );
    }

    // ================= ROUTES VALIDATION =================
const routes = [
  ...(memory?.routes || []),
  ...(latestPlan?.routes || [])
]
.filter(Boolean)
.filter((v, i, a) => a.indexOf(v) === i);

    for (const route of routes) {

const routeName = route
  .replace(/\//g, "")
  .toLowerCase();

const routeExists = workspaceFiles.some(file =>
  file.toLowerCase().includes(routeName)
);

if (!routeExists) {

  addIssue(
    "frontend_missing_route",
    "medium",
    `Generate page for ${route}`,
    { route }
  );

}

const normalizedBackend =
  backend
    ?.replace(/\s+/g, "")
    ?.toLowerCase() || "";

if (
  backend &&
  !normalizedBackend.includes(
    route.replace(/\s+/g, "").toLowerCase()
  )
) {
        addIssue(
          "backend_missing_route",
          "critical",
          `Implement endpoint ${route}`,
          { route }
        );
      }
    }

    // ================= ENTITY VALIDATION =================
    if (memory?.entities?.includes("User")) {

      if (backend && !backend.includes("users")) {
        addIssue(
          "user_entity_not_implemented",
          "high",
          "Create users array or DB model"
        );
      }
    }

const entities = [
  ...(memory?.entities || []),
  ...(latestPlan?.entities || [])
]
.filter(Boolean)
.filter((v, i, a) => a.indexOf(v) === i);

for (const entity of entities) {

  if (
    backend &&
    !backend.includes(entity)
  ) {

    addIssue(
      "missing_entity",
      "high",
      `Implement entity ${entity}`
    );

  }

}

    // ================= FINAL DECISION =================
    const critical = issues.filter(i => i.severity === "critical");

    const verdict =
      critical.length > 0
        ? "rejected"
        : issues.length > 0
          ? "warning"
          : "approved";

    return {
      ok: verdict === "approved",

      data: {
        originalRequest,

        verdict,

        repair: critical.length > 0 || issues.length > 0,

        issues,

        summary: {
          total: issues.length,
          critical: critical.length,
          high: issues.filter(i => i.severity === "high").length,
          medium: issues.filter(i => i.severity === "medium").length
        },

        busEvents: bus.length
      }
    };
  }
});
