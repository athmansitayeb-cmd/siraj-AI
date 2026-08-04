import { getDB } from "./db/mongoClient.js";

const COLLECTION = "workspace_memories";

const DEFAULT_MEMORY = {

  version: 1,

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

function uniqueItems(arr = []) {

  return [
    ...new Map(
      arr.map(item => [
        JSON.stringify(item),
        item
      ])
    ).values()
  ];

}

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

routes: uniqueItems([
  ...(current.routes || []),
  ...(patch.routes || [])
]).slice(-200),

pages: uniqueItems([
  ...(current.pages || []),
  ...(patch.pages || [])
]).slice(-200),

entities: uniqueItems([
  ...(current.entities || []),
  ...(patch.entities || [])
]).slice(-200),

criticIssues: [
  ...new Map(
    [
      ...(current.criticIssues || []),
      ...(patch.criticIssues || [])
    ].map(item => [
      JSON.stringify(item),
      item
    ])
  ).values()
].slice(-100),

sharedContext: [
  ...(current.sharedContext || []),
  ...(patch.sharedContext || [])
].slice(-100),

    updatedAt: Date.now()

  };

  await db.collection(COLLECTION).updateOne(
    { workspaceId },
    { $set: merged },
    { upsert: true }
  );

  return merged;

}
