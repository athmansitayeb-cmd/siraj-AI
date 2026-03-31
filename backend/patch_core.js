// ===== SIRAJ CORE PATCH =====

// enforce safe conversationId
export const safeConversationId = (id) => {
  if (!id || typeof id !== "string") return null;
  return id.trim();
};

// prevent duplicate messages
export const pushUnique = (arr, msg) => {
  const last = arr[arr.length - 1];
  if (last?.content === msg.content && last?.role === msg.role) return;
  arr.push(msg);
};
