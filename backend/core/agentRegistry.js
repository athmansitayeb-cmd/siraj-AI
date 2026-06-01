const agents = {};

// ================= REGISTER =================
export function registerAgent(name, config) {

  agents[name] = {
    name,
    description: config.description || "",
    model: config.model || "default",
    execute: config.execute
  };

}

// ================= GET =================
export function getAgent(name) {
  return agents[name];
}

// ================= LIST =================
export function listAgents() {
  return Object.keys(agents);
}
