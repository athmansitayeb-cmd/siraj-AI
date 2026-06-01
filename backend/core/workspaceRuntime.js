import { updateWorkspaceBrain } from "./workspaceBrain.js";
import { updateWorkspace } from "./workspaceMemory.js";
import { pushWorkspaceEvent } from "./workspaceEvents.js";

export function updateWorkspaceRuntime(workspaceId, data = {}) {
  if (!workspaceId) return;

  // 1. brain state
  if (data.brain) {
    updateWorkspaceBrain(workspaceId, data.brain);
  }

  // 2. memory state
  if (data.memory) {
    updateWorkspace(workspaceId, data.memory);
  }

  // 3. event (optional)
  if (data.event) {
    pushWorkspaceEvent(workspaceId, data.event);
  }

  // 4. optional meta hook (future)
  if (data.meta?.log) {
    console.log("[WORKSPACE RUNTIME]", workspaceId, data.meta.log);
  }
}
