import { registerAgent } from "../agentRegistry.js";
import {
  readWorkspaceFile,
  listWorkspaceFiles
} from "../workspaceFs.js";
import { groq } from "../groqClient.js";
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
const plannerKnowledge =
  [...bus]
    .reverse()
    .find(k => k.agent === "planner");

const latestPlan =
  plannerKnowledge?.data || {};

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
].filter(Boolean);

const uniquePages = [
  ...new Map(
    pages.map(page => [
      `${page?.name}:${page?.route}`,
      page
    ])
  ).values()
];

for (const page of uniquePages) {

const pageName =
  typeof page === "string"
    ? page
    : page.name;

const exists = workspaceFiles.some(file =>
  file.endsWith(`/${pageName}.jsx`)
);

if (!exists) {
  addIssue(
    "missing_page",
    "high",
    `Generate page ${pageName}`
  );
}

}

    // ================= ROUTES VALIDATION =================

const routes = [
  ...(memory?.routes || []),
  ...(latestPlan?.routes || [])
]
.filter(Boolean)
.filter((v, i, a) => a.indexOf(v) === i);

for (let i = 0; i < routes.length; i++) {

  const route = routes[i];

const expectedPage =
  pages.find(page => {

    if (typeof page === "string") {
      return false;
    }

    return page.route === route;

  });

  if (expectedPage) {

    const pageExists = workspaceFiles.some(file =>
      file.toLowerCase().endsWith(
        `/${expectedPage.name.toLowerCase()}.jsx`
      )
    );

    if (!pageExists) {
      addIssue(
        "frontend_missing_page",
        "high",
        `Generate page ${expectedPage.name}`,
        {
          route,
          page: expectedPage.name
        }
      );
    }
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

const review = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  messages: [
    {
      role: "system",
      content: `
You are SIRAJ Quality Critic.

Review the generated software.

Return ONLY valid JSON.

{
  "issues":[
    {
      "agent":"frontend",
      "file":"frontend/Login.jsx",
      "severity":"critical",
      "description":"",
      "fix":""
    }
  ]
}

Rules:

Every issue MUST contain:

agent

file

severity

description

fix

Examples:

Missing Login page

agent=frontend

file=frontend/Login.jsx

Missing Express endpoint

agent=backend

file=backend/server.js

Missing database schema

agent=database

file=database/schema.sql

Return JSON only.
`
    },
    {
      role: "user",
      content: JSON.stringify({
        request: originalRequest,
        files: workspaceFiles,
        backend,
        frontend
      })
    }
  ]
});

try {

  const ai = JSON.parse(
    review.choices[0].message.content
  );

  if (Array.isArray(ai.issues)) {

    for (const issue of ai.issues) {

      issue.agent ??= "backend";

      issue.file ??=
        issue.agent === "frontend"
          ? "frontend/App.jsx"
          : "backend/server.js";

      issues.push(issue);

    }

  }

} catch {}

const unique = new Map();

for (const issue of issues) {

  unique.set(
    `${issue.agent}:${issue.file}:${issue.fix || issue.description || issue.type}`,
    issue
  );

}

issues.length = 0;
issues.push(...unique.values());

// ================= FINAL DECISION =================

const critical =
  issues.filter(i => i.severity === "critical");

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
