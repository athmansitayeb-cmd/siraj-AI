const registry = {};

// ================= REGISTER =================
export function registerTool(name, config) {

  registry[name] = {
    name,
    description: config.description || "",
    risk: config.risk || "low",
    timeout: config.timeout || 10000,
    execute: config.execute
  };

}

// ================= GET =================
export function getTool(name) {
  return registry[name];
}

// ================= LIST =================
export function listTools() {
  return Object.keys(registry);
}
