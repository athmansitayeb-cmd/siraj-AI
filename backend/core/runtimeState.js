import { getDB } from "./db/mongoClient.js";

// ================= CREATE =================
export async function createRuntimeState(runtime) {

  const db = await getDB();

  const doc = {
    runtimeId: runtime.runtimeId,
    workspaceId: runtime.workspaceId || null,
    graph: runtime.graph || {},
    status: runtime.status || "running",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await db
    .collection("runtime_states")
    .insertOne(doc);

  return doc;
}

// ================= UPDATE =================
export async function updateRuntimeState(
  runtimeId,
  patch = {}
) {

  const db = await getDB();

  await db.collection("runtime_states")
    .updateOne(
      { runtimeId },
      {
        $set: {
          ...patch,
          updatedAt: Date.now()
        }
      }
    );
}

// ================= GET =================
export async function getRuntimeState(
  runtimeId
) {

  const db = await getDB();

  return db
    .collection("runtime_states")
    .findOne({ runtimeId });
}

// ================= DELETE =================
export async function deleteRuntimeState(runtimeId) {

  const db = await getDB();

  await db
    .collection("runtime_states")
    .deleteOne({
      runtimeId
    });

}

// ================= RUNNING =================
export async function getRunningRuntimes() {

  const db = await getDB();

  return db
    .collection("runtime_states")
    .find({
      status: "running"
    })
    .toArray();

}
