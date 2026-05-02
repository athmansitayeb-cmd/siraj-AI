import UserMemory from "./userMemory.model.js";

// ================= GET =================
export async function getUserMemory(userId) {
  let doc = await UserMemory.findOne({ userId });

  if (!doc) {
    doc = await UserMemory.create({
      userId,
      goals: [],
      struggles: [],
      habits: [],
      lastState: ""
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
// ================= CHECKINS =================
if (extracted.checkin) {
  memory.checkins = [...memory.checkins, extracted.checkin].slice(-10);
  memory.lastCheckAt = new Date();
}

  // ✅ LIMIT FACTS (مهم جداً)
// ================= GOALS =================
if (extracted.goals?.length) {
  memory.goals = [...new Set([
    ...memory.goals,
    ...extracted.goals
  ])].slice(-10);
}

// ================= STRUGGLES =================
if (extracted.struggles?.length) {
  memory.struggles = [...new Set([
    ...memory.struggles,
    ...extracted.struggles
  ])].slice(-10);
}

// ================= HABITS =================
if (extracted.habits?.length) {
  memory.habits = [...new Set([
    ...memory.habits,
    ...extracted.habits
  ])].slice(-10);
}

// ================= STATE =================
if (extracted.lastState) {
  memory.lastState = extracted.lastState;
}

  // ⛔️ قص JSON لو كبر
  const prefStr = JSON.stringify(memory.preferences);
  if (prefStr.length > 500) {
    memory.preferences = {};
  }

  const profileStr = JSON.stringify(memory.profile);
  if (profileStr.length > 500) {
    memory.profile = {};
  }

  memory.updatedAt = new Date();

  await memory.save();
}
