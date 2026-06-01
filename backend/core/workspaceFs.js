import fs from "fs/promises";
import path from "path";

const ROOT =
  "/opt/siraj/backend/runtime/workspaces";

// ================= GET PATH =================
export function getWorkspacePath(workspaceId) {

  return path.join(ROOT, workspaceId);

}

// ================= ENSURE =================
export async function ensureWorkspace(workspaceId) {

  const workspacePath =
    getWorkspacePath(workspaceId);

  await fs.mkdir(workspacePath, {
    recursive: true
  });

  return workspacePath;
}

// ================= WRITE FILE =================
export async function writeWorkspaceFile({
  workspaceId,
  file,
  content
}) {

  const workspacePath =
    await ensureWorkspace(workspaceId);

  const fullPath =
    path.join(workspacePath, file);

  await fs.mkdir(
    path.dirname(fullPath),
    { recursive: true }
  );

  await fs.writeFile(
    fullPath,
    content,
    "utf8"
  );

  return {
    ok: true,
    path: fullPath
  };
}

// ================= READ FILE =================
export async function readWorkspaceFile({
  workspaceId,
  file
}) {

  const fullPath = path.join(
    getWorkspacePath(workspaceId),
    file
  );

  const content =
    await fs.readFile(fullPath, "utf8");

  return content;
}
