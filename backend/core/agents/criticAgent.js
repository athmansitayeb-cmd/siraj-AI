import { registerAgent } from "../agentRegistry.js";
import {
  readWorkspaceFile,
  listWorkspaceFiles
} from "../workspaceFs.js";
import { groq } from "../groqClient.js";
import { getWorkspaceMemory } from "../workspaceMemory.js";
import { readKnowledge } from "../sharedWorkspaceBus.js";

registerAgent("critic", {

  async execute({ input, context }) {

    const ws = context?.workspaceId;

    const workspaceVersion =
      context?.workspace?.snapshot?.version || 1;

    // Production smoke validates orchestration without a workspace.
    if (
      context?.mode === "production_smoke" &&
      !ws
    ) {
      return {
        ok: true,
        data: {
          originalRequest:
            context?.originalPrompt || "",

          verdict: "approved",

          repair: false,

          issues: [],

          summary: {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0
          },

          busEvents: 0,

          smoke: true
        }
      };
    }

    if (!ws) {
      return {
        ok: false,
        data: {
          originalRequest: "",
          verdict: "rejected",
          repair: false,
          issues: [{
            agent: "system",
            file: "",
            severity: "critical",
            description: "Workspace ID is missing.",
            fix: "Provide a valid workspaceId."
          }],
          summary: {
            total: 1,
            critical: 1,
            high: 0,
            medium: 0
          },
          busEvents: 0
        }
      };
    }

    // ============================================================
    // CONTEXT
    // ============================================================

    const memory =
      await getWorkspaceMemory(
        ws,
        workspaceVersion
      );

    const bus =
      await readKnowledge(
        ws,
        workspaceVersion
      );

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

    // ============================================================
    // WORKSPACE
    // ============================================================

    const workspaceFiles =
      await listWorkspaceFiles(ws);

    const normalizePath = value =>
      String(value || "")
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")
        .trim();

    const files = workspaceFiles
      .map(normalizePath)
      .filter(Boolean);

    const fileExists = file =>
      files.includes(normalizePath(file));

    const findFile = suffix =>
      files.find(file =>
        file.toLowerCase().endsWith(
          normalizePath(suffix).toLowerCase()
        )
      );

    // ============================================================
    // LOAD FRONTEND
    // ============================================================

    const frontendFiles = files.filter(file =>
      file.startsWith("frontend/") &&
      /\.(jsx|tsx|js|ts)$/.test(file)
    );

    let frontend = "";

    for (const file of frontendFiles) {

      try {

        const content = await readWorkspaceFile({
          workspaceId: ws,
          file
        });

        if (content) {
          frontend +=
            `\n\n===== ${file} =====\n\n${content}`;
        }

      } catch {}

    }

    // ============================================================
    // LOAD BACKEND
    // ============================================================

    const backendFiles = files.filter(file =>
      file.startsWith("backend/") &&
      /\.(js|ts|mjs|cjs)$/.test(file)
    );

    let backend = "";

    for (const file of backendFiles) {

      try {

        const content = await readWorkspaceFile({
          workspaceId: ws,
          file
        });

        if (content) {
          backend +=
            `\n\n===== ${file} =====\n\n${content}`;
        }

      } catch {}

    }

    const serverFile =
      findFile("backend/server.js");

    // ============================================================
    // ISSUES
    // ============================================================

    const issues = [];

    const addIssue = (
      agent,
      file,
      severity,
      description,
      fix,
      meta = {}
    ) => {

      issues.push({
        agent,
        file,
        severity,
        description,
        fix,
        meta
      });

    };

    // ============================================================
    // BASIC FILE VALIDATION
    // ============================================================

    if (!frontendFiles.length) {

      addIssue(
        "frontend",
        "frontend/App.jsx",
        "critical",
        "No frontend source files were found.",
        "Create the required frontend application files."
      );

    }

    if (!backendFiles.length) {

      addIssue(
        "backend",
        "backend/server.js",
        "critical",
        "No backend source files were found.",
        "Create the backend server and required API routes."
      );

    }

    // ============================================================
    // PAGES
    // ============================================================

    const rawPages = [
      ...(Array.isArray(memory?.pages)
        ? memory.pages
        : []),

      ...(Array.isArray(latestPlan?.pages)
        ? latestPlan.pages
        : [])
    ];

    const pages = rawPages
      .map(page => {

        if (typeof page === "string") {

          return {
            name: page.trim(),
            route: ""
          };

        }

        if (page && typeof page === "object") {

          return {
            name: String(page.name || "").trim(),
            route:
              typeof page.route === "string"
                ? page.route.trim()
                : ""
          };

        }

        return null;

      })
      .filter(page => page?.name);

    const uniquePages = [
      ...new Map(
        pages.map(page => [
          `${page.name}:${page.route}`,
          page
        ])
      ).values()
    ];

    for (const page of uniquePages) {

      const expectedName =
        page.name.toLowerCase();

      const exists =
        files.some(file => {

          const base =
            file
              .split("/")
              .pop()
              ?.replace(/\.(jsx|tsx)$/i, "")
              .toLowerCase();

          return base === expectedName;

        });

      if (!exists) {

        addIssue(
          "frontend",
          `frontend/${page.name}.jsx`,
          "high",
          `Required page "${page.name}" is missing.`,
          `Create frontend/${page.name}.jsx`,
          {
            page: page.name,
            route: page.route
          }
        );

      }

    }

    // ============================================================
    // ROUTES
    // ============================================================

    const rawRoutes = [
      ...(Array.isArray(memory?.routes)
        ? memory.routes
        : []),

      ...(Array.isArray(latestPlan?.routes)
        ? latestPlan.routes
        : [])
    ];

    const normalizeRoute = value => {

      let route = "";

      if (typeof value === "string") {

        route = value;

      } else if (value && typeof value === "object") {

        route =
          value.route ||
          value.path ||
          value.url ||
          value.endpoint ||
          "";

      }

      route = String(route).trim();

      if (!route) {
        return "";
      }

      if (!route.startsWith("/")) {
        route = `/${route}`;
      }

      return route
        .replace(/\/+/g, "/")
        .replace(/\/$/, "") || "/";

    };

    const routes = [
      ...new Set(
        rawRoutes
          .map(normalizeRoute)
          .filter(Boolean)
      )
    ];

    // ============================================================
    // ROUTE VALIDATION
    // ============================================================

    const normalizedBackend =
      backend
        .replace(/\s+/g, "")
        .toLowerCase();

    for (const route of routes) {

      const normalizedRoute =
        route
          .replace(/^\/api/, "")
          .replace(/\/$/, "") || "/";

      const routePath =
        normalizedRoute.endsWith("/*")
          ? normalizedRoute.slice(0, -2) || "/"
          : normalizedRoute;

      const routeVariants = [
        normalizedRoute,
        routePath,
        normalizedRoute.replace(/^\//, ""),
        routePath.replace(/^\//, "")
      ]
        .filter(Boolean)
        .map(v => v.toLowerCase());

      const routeExists =
        routeVariants.some(variant =>
          normalizedBackend.includes(variant)
        );

      if (!routeExists && backendFiles.length) {

        addIssue(
          "backend",
          serverFile || "backend/server.js",
          "critical",
          `Backend endpoint "${route}" was not found.`,
          `Implement backend endpoint ${route}`,
          {
            route
          }
        );

      }

    }

    // ============================================================
    // ENTITY VALIDATION
    // ============================================================

    const entities = [
      ...(Array.isArray(memory?.entities)
        ? memory.entities
        : []),

      ...(Array.isArray(latestPlan?.entities)
        ? latestPlan.entities
        : [])
    ]
      .filter(v =>
        typeof v === "string" &&
        v.trim()
      )
      .map(v => v.trim())
      .filter((v, i, a) =>
        a.indexOf(v) === i
      );

    for (const entity of entities) {

      if (
        backend &&
        !backend.toLowerCase()
          .includes(entity.toLowerCase())
      ) {

        addIssue(
          "backend",
          serverFile || "backend/server.js",
          "high",
          `Required entity "${entity}" was not found in the backend.`,
          `Implement entity ${entity}`,
          {
            entity
          }
        );

      }

    }

    // ============================================================
    // LLM REVIEW
    // ============================================================

    try {

      const review =
        await groq.chat.completions.create({

          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-120b",

          temperature: 0,

          messages: [

            {
              role: "system",

              content: `
You are SIRAJ Quality Critic.

Review the generated software against the original request.

Return ONLY valid JSON.

Schema:

{
  "issues": [
    {
      "agent": "frontend|backend|database|system",
      "file": "path/to/file",
      "severity": "critical|high|medium",
      "description": "specific problem",
      "fix": "specific repair"
    }
  ]
}

Rules:

1. Only report real problems.
2. Do not invent files.
3. Do not report missing requirements unless they are actually required by the request or plan.
4. Every issue MUST contain:
   agent
   file
   severity
   description
   fix
5. Use the actual workspace file paths.
6. Do not duplicate the same problem.
7. Do not complain about style unless it breaks functionality.
8. Do not mark something critical unless it prevents the application from functioning.
9. Return [] if the software is correct.
10. JSON only. No markdown.
`
            },

            {
              role: "user",

              content: JSON.stringify({

                request: originalRequest,

                files,

                frontend,

                backend

              })

            }

          ]

        });

      const raw =
        review?.choices?.[0]?.message?.content;

      if (raw) {

        const ai =
          JSON.parse(raw);

        if (Array.isArray(ai.issues)) {

          for (const issue of ai.issues) {

            if (!issue || typeof issue !== "object") {
              continue;
            }

            const agent =
              ["frontend", "backend", "database", "system"]
                .includes(issue.agent)
                ? issue.agent
                : "system";

            const severity =
              ["critical", "high", "medium"]
                .includes(issue.severity)
                ? issue.severity
                : "medium";

            const file =
              normalizePath(issue.file) ||
              (
                agent === "frontend"
                  ? "frontend/App.jsx"
                  : "backend/server.js"
              );

            const description =
              String(issue.description || "").trim();

            const fix =
              String(issue.fix || "").trim();

            if (!description || !fix) {
              continue;
            }

            addIssue(
              agent,
              file,
              severity,
              description,
              fix
            );

          }

        }

      }

    } catch (error) {

      // LLM failure must not destroy deterministic validation.
      // The Critic can still make a decision from local checks.

    }

    // ============================================================
    // NORMALIZE + DEDUPLICATE
    // ============================================================

    const unique =
      new Map();

    for (const issue of issues) {

      const key = [
        issue.agent,
        normalizePath(issue.file),
        issue.severity,
        issue.description
          ?.toLowerCase()
          .trim()
      ].join(":");

      if (!unique.has(key)) {

        unique.set(key, {
          agent: issue.agent,
          file: normalizePath(issue.file),
          severity: issue.severity,
          description: issue.description,
          fix: issue.fix,
          ...(issue.meta &&
            Object.keys(issue.meta).length
              ? { meta: issue.meta }
              : {})
        });

      }

    }

    const finalIssues =
      [...unique.values()];

    // ============================================================
    // FINAL DECISION
    // ============================================================

    const critical =
      finalIssues.filter(
        issue => issue.severity === "critical"
      );

    const high =
      finalIssues.filter(
        issue => issue.severity === "high"
      );

    const medium =
      finalIssues.filter(
        issue => issue.severity === "medium"
      );

    let verdict;

    if (critical.length > 0) {

      verdict = "rejected";

    } else if (finalIssues.length > 0) {

      verdict = "warning";

    } else {

      verdict = "approved";

    }

return {

  ok: true,

  data: {

    originalRequest,

    verdict,

    repair:
      finalIssues.length > 0,

    issues:
      finalIssues,

    summary: {

      total:
        finalIssues.length,

      critical:
        critical.length,

      high:
        high.length,

      medium:
        medium.length

    },

    busEvents:
      Array.isArray(bus)
        ? bus.length
        : 0

  }

};

  }

});
