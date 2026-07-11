import fs from "fs/promises";
import path from "path";
import fsSync from "fs";

const ROOT = "/opt/siraj/backend/runtime/workspaces";

// ================= PATH GUARD =================
function safePath(base, target) {
  const resolved = path.resolve(base, target);

  if (!resolved.startsWith(base)) {
    throw new Error("INVALID_WORKSPACE_PATH");
  }

  return resolved;
}

// ================= GET PATH =================
export function getWorkspacePath(workspaceId) {
  return path.join(ROOT, workspaceId);
}

// ================= ENSURE =================
export async function ensureWorkspace(workspaceId) {
  const workspacePath = getWorkspacePath(workspaceId);

  await fs.mkdir(workspacePath, { recursive: true });

  return workspacePath;
}

// ================= WRITE FILE =================
export async function writeWorkspaceFile({
  workspaceId,
  file,
  content
}) {
  const workspacePath = await ensureWorkspace(workspaceId);

  const fullPath = safePath(workspacePath, file);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  await fs.writeFile(fullPath, content, "utf8");

  return { ok: true, path: fullPath };
}

// ================= READ FILE =================
export async function readWorkspaceFile({
  workspaceId,
  file
}) {
  try {
    const workspacePath = getWorkspacePath(workspaceId);

    const fullPath = safePath(workspacePath, file);

    const content = await fs.readFile(fullPath, "utf8");

    return content;
  } catch (err) {
    return null;
  }
}

export async function listWorkspaceFiles(workspaceId) {

  const workspacePath = getWorkspacePath(workspaceId);

  const files = [];

  function walk(dir) {

    const entries = fsSync.readdirSync(dir, {
      withFileTypes: true
    });

    for (const entry of entries) {

      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {

        walk(full);

      } else {

        files.push(
          path.relative(workspacePath, full)
        );

      }

    }

  }

  try {

    walk(workspacePath);

  } catch {

    return [];

  }

  return files;

}
