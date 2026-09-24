import fs from "fs/promises";
import path from "path";
import fsSync from "fs";

const ROOT = "/opt/siraj/backend/runtime/workspaces";

// ================= PATH GUARD =================
async function safePath(base, target) {
  const resolvedBase = await fs.realpath(base);
  const resolved = path.resolve(resolvedBase, target);
  const relative = path.relative(resolvedBase, resolved);

  if (
    relative !== "" &&
    (relative.startsWith("..") || path.isAbsolute(relative))
  ) {
    throw new Error("INVALID_WORKSPACE_PATH");
  }

  // Reject symlinks in every existing component of the target path.
  // This prevents escaping the workspace through a symlink.
  const parts = relative
    .split(path.sep)
    .filter(Boolean);

  let current = resolvedBase;

  for (const part of parts) {
    current = path.join(current, part);

    try {
      const stat = await fs.lstat(current);

      if (stat.isSymbolicLink()) {
        throw new Error("INVALID_WORKSPACE_SYMLINK");
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        // The final file or a new directory does not exist yet.
        // Existing parent components have already been checked.
        break;
      }

      throw err;
    }
  }

  return resolved;
}

// ================= WORKSPACE ID GUARD =================
function safeWorkspaceId(workspaceId) {
  if (
    typeof workspaceId !== "string" ||
    !workspaceId.trim()
  ) {
    throw new Error("INVALID_WORKSPACE_ID");
  }

  const id = workspaceId.trim();

  if (
    id === "." ||
    id === ".." ||
    id.includes("/") ||
    id.includes("\\") ||
    id.includes("\0")
  ) {
    throw new Error("INVALID_WORKSPACE_ID");
  }

  return id;
}

// ================= GET PATH =================
export function getWorkspacePath(workspaceId) {
  const id = safeWorkspaceId(workspaceId);
  return path.join(ROOT, id);
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

  const fullPath = await safePath(workspacePath, file);

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

    const fullPath = await safePath(workspacePath, file);

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
// ================= WORKSPACE SNAPSHOT =================

export async function getWorkspaceSnapshot(workspaceId) {

  const files =
    await listWorkspaceFiles(workspaceId);

  const snapshot = {
    files: [],
    map: {},
    stats: {
      totalFiles: files.length
    }
  };

  for (const file of files) {

    const content =
      await readWorkspaceFile({
        workspaceId,
        file
      });

    snapshot.files.push({
      path: file,
      size: content?.length || 0
    });

    snapshot.map[file] =
      content || "";

  }

  return snapshot;

}
