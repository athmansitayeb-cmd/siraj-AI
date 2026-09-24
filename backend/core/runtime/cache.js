import crypto from "crypto";

// ============================================================
// GLOBAL EXECUTION CACHE
// ============================================================

const executionCache = new Map();

const MAX_CACHE_SIZE = 500;

// ============================================================
// CACHE DECISION
// ============================================================

export function shouldUseCache(task) {

  // Never cache synthesis.
  if (task.type === "synthesis") {
    return false;
  }

  // Critic must always inspect the current workspace.
  if (task.agent === "critic") {
    return false;
  }

  // Repair tasks must always run against current state.
  if (
    task.agent === "repair" ||
    task.input?.toLowerCase?.().includes("repair") ||
    task.input?.toLowerCase?.().includes("fix")
  ) {
    return false;
  }

  return true;
}

// ============================================================
// HASH TASK
// ============================================================

export function hashTask(task, context) {

  return crypto
    .createHash("md5")
    .update(
      JSON.stringify({
        task: {
          id: task.id,
          type: task.type,
          agent: task.agent,
          tool: task.tool,
          input: task.input,
          dependsOn: task.dependsOn || [],
          priority: task.priority,
          cost: task.cost
        },

        workspaceId:
          context.workspaceId || null,

        dependencyResults:
          context.dependencyResults || []
      })
    )
    .digest("hex");
}

// ============================================================
// CACHE RESULT
// ============================================================

export function cacheResult(key, output) {

  executionCache.set(key, output);

  if (
    executionCache.size >
    MAX_CACHE_SIZE
  ) {

    const firstKey =
      executionCache.keys().next().value;

    if (firstKey) {
      executionCache.delete(firstKey);
    }
  }
}

// ============================================================
// CACHE LOOKUP
// ============================================================

export function getCachedResult(key) {
  return executionCache.get(key);
}

export function hasCachedResult(key) {
  return executionCache.has(key);
}

// ============================================================
// CACHE CLEAR
// ============================================================

export function clearExecutionCache() {
  executionCache.clear();
}
