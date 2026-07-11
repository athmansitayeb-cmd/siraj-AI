const registry = new Map();

// ================= REGISTER =================
export function registerTool(name, config) {
  registry.set(name, {
    name,
    description: config.description || "",
    risk: config.risk || "low",
    timeout: config.timeout || 10000,
    execute: config.execute
  });
}

// ================= GET =================
export function getTool(name) {
  return registry.get(name) || null;
}

// ================= LIST =================
export function listTools() {
  return Array.from(registry.keys());
}

// ================= SAFE EXECUTE =================
export async function runTool(name, input, context) {
  const tool = getTool(name);

  if (!tool) {
    throw new Error(`TOOL_NOT_FOUND: ${name}`);
  }

  return await tool.execute(input, context);
}
