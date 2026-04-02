import UserMemory from "./userMemory.model.js";

// ================= GET =================
export async function getUserMemory(userId) {
  let doc = await UserMemory.findOne({ userId });

  if (!doc) {
    doc = await UserMemory.create({
      userId,
      facts: [],
      preferences: {},
      profile: {}
    });
  }

  return doc;
}

// ================= UPDATE =================
export async function updateUserMemory(userId, extracted) {
  if (!extracted) return;

  let memory = await UserMemory.findOne({ userId });

  if (!memory) {
    memory = await UserMemory.create({
      userId,
      facts: [],
      preferences: {},
      profile: {}
    });
  }

  memory.facts = [...new Set([
    ...memory.facts,
    ...(extracted.facts || [])
  ])];

  memory.preferences = {
    ...memory.preferences,
    ...(extracted.preferences || {})
  };

  memory.profile = {
    ...memory.profile,
    ...(extracted.profile || {})
  };

  memory.updatedAt = new Date();

  await memory.save();
}
