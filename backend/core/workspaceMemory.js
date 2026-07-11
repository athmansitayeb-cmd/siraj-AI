import { getDB } from "./db/mongoClient.js";

const COLLECTION = "workspace_memories";

const DEFAULT_MEMORY = {
  architecture: {},

  frontend: {},
  backend: {},
  database: {},

  routes: [],
  pages: [],
  entities: [],

  criticIssues: [],

  sharedContext: [],

  originalRequest: "",

  createdAt: 0,
  updatedAt: 0
};

// ================= GET =================
export async function getWorkspaceMemory(workspaceId) {

  const db = await getDB();

  let memory = await db
    .collection(COLLECTION)
    .findOne({ workspaceId });

  if (!memory) {

    memory = {
      workspaceId,
      ...structuredClone(DEFAULT_MEMORY),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db
      .collection(COLLECTION)
      .insertOne(memory);

  }

  return memory;

}

// ================= UPDATE =================
export async function updateWorkspaceMemory(
  workspaceId,
  patch = {}
) {

  const db = await getDB();

  const current =
    await getWorkspaceMemory(workspaceId);

  const merged = {

    ...current,

    ...patch,

    architecture: {
      ...(current.architecture || {}),
      ...(patch.architecture || {})
    },

    frontend: {
      ...(current.frontend || {}),
      ...(patch.frontend || {})
    },

    backend: {
      ...(current.backend || {}),
      ...(patch.backend || {})
    },

    database: {
      ...(current.database || {}),
      ...(patch.database || {})
    },

    routes: [
      ...new Set([
        ...(current.routes || []),
        ...(patch.routes || [])
      ])
    ],

    pages: [
      ...new Set([
        ...(current.pages || []),
        ...(patch.pages || [])
      ])
    ],

    entities: [
      ...new Set([
        ...(current.entities || []),
        ...(patch.entities || [])
      ])
    ],

    criticIssues: [
      ...(current.criticIssues || []),
      ...(patch.criticIssues || [])
    ],

    sharedContext:
      patch.sharedContext ||
      current.sharedContext ||

      [],

    updatedAt: Date.now()

  };

  await db.collection(COLLECTION).updateOne(
    { workspaceId },
    { $set: merged },
    { upsert: true }
  );

  return merged;

}
