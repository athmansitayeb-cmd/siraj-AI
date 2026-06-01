const activeWorkspaces = new Map();

export function getWorkspace(workspaceId) {
  return activeWorkspaces.get(workspaceId);
}

export function updateWorkspace(workspaceId, data = {}) {

  const current =
    activeWorkspaces.get(workspaceId) || {};

  const updated = {
    ...current,
    ...data,
    updatedAt: Date.now()
  };

  activeWorkspaces.set(workspaceId, updated);

  return updated;
}
