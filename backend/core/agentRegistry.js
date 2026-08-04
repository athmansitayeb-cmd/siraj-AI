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

export function findAgentsByCapability(capability) {

  return Object.values(agents)

    .filter(agent =>
      agent.capabilities?.includes(capability)
    )

    .sort((a, b) => b.priority - a.priority);

}

export function resolveAgent(task = {}) {

  if (task.agent && agents[task.agent]) {
    return agents[task.agent];
  }

  if (task.capability) {

    const candidates =
      findAgentsByCapability(task.capability);

    if (candidates.length) {
      return candidates[0];
    }

  }

  return null;

}

export function updateAgent(name, patch = {}) {

  if (!agents[name]) return false;

  agents[name] = {
    ...agents[name],
    ...patch
  };

  return true;

}

export function registerDynamicAgent(name) {

  if (agents[name]) {
    return agents[name];
  }

  return registerAgent(name, {

    description: "Dynamic agent",

    capabilities: [name],

    llm: true,

    deterministic: false,

    priority: 0,

    execute: async () => ({
      ok: false,
      error: `Dynamic agent '${name}' has no implementation`
    })

  });

}


