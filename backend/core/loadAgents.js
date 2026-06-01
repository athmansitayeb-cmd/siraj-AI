export function loadAgents() {
  return Promise.all([
    import("./agents/plannerAgent.js"),
    import("./agents/researchAgent.js"),
    import("./agents/criticAgent.js"),
    import("./agents/frontendAgent.js"),
    import("./agents/backendAgent.js")
  ]);
}
