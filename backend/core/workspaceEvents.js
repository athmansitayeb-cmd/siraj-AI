const eventsStore = new Map();

function ensure(workspaceId) {
  if (!eventsStore.has(workspaceId)) {
    eventsStore.set(workspaceId, []);
  }
  return eventsStore.get(workspaceId);
}

export function pushWorkspaceEvent(workspaceId, event) {
  if (!workspaceId) return;

  const fullEvent = {
    ...event,
    ts: Date.now()
  };

  const list = ensure(workspaceId);

  list.push(fullEvent);

  // limit RAM
  if (list.length > 100) {
    list.splice(0, list.length - 100);
  }

  // realtime (fast path)
  const io = globalThis.io || globalThis.app?.locals?.io;

  if (io) {
    io.to(`workspace:${workspaceId}`).emit("workspace-event", fullEvent);
  }

  // async DB write (non-blocking, fire & forget)
  queueMicrotask(async () => {
    try {
      const { getDB } = await import("./db/mongoClient.js");
      const db = await getDB();

      await db.collection("workspace_events").insertOne({
        workspaceId,
        ...fullEvent
      });
    } catch (e) {
      console.error("[EVENT DB FAIL]", e.message);
    }
  });
}

export function getWorkspaceEvents(workspaceId) {
  return eventsStore.get(workspaceId) || [];
}
