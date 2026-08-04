import { getDB } from "./db/mongoClient.js";

const COLLECTION = "agent_memories";

/**
 * تحميل ذاكرة الوكيل من MongoDB Atlas
 */
export async function loadAgentMemory(agent) {

  const db = await getDB();

  let memory = await db
    .collection(COLLECTION)
    .findOne({ agent });

  if (!memory) {

    memory = {
      agent,
      version: 1,

      runs: 0,
      successes: 0,
      failures: 0,

      lastTasks: [],
      notes: [],
      specialization: {},

      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await db.collection(COLLECTION).insertOne(memory);
  }

  return memory;
}

/**
 * حفظ الذاكرة (atomic update)
 */
export async function saveAgentMemory(agent, memory) {

  const db = await getDB();

  await db.collection(COLLECTION).updateOne(
    { agent },
    {
      $set: {
        version: memory.version || 1,

        runs: memory.runs,
        successes: memory.successes,
        failures: memory.failures,
        lastRun: memory.lastRun || null,
        lastTasks: (memory.lastTasks || []).slice(0,20),

        notes: (memory.notes || []).slice(-100),
        specialization: memory.specialization,
        updatedAt: Date.now()
      }
    },
    { upsert: true }
  );
}

