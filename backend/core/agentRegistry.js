const agents = {};

// ================= REGISTER =================
export function registerAgent(name, config) {

  if (agents[name]) {
    console.warn("[AGENT ALREADY REGISTERED]", name);
    return agents[name];
  }

  agents[name] = {
    name,
    description: config.description || "",
    model: config.model || "default",

    role: config.role || name,
    capabilities: config.capabilities || [],
    priority: config.priority || 0,
    deterministic: config.deterministic ?? false,
    llm: config.llm ?? true,
    version: config.version || "1.0",

    execute: config.execute
  };

  return agents[name];
}

// ================= GET =================
export function getAgent(name) {
  return agents[name] || null;
}

// ================= LIST =================
export function listAgents() {
  return Object.keys(agents);
}

// ================= ALL =================
export function getAllAgents() {
  return Object.values(agents);
}

// ================= EXISTS =================
export function hasAgent(name) {
  return !!agents[name];
}
