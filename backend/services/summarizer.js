import { fetchAI } from "./ai.js";
import client from "./sanityClient.js";

export async function summarizeConversation(conversationId) {
  const query = `*[_type == "message" && conversation._ref == $conversationId] | order(_createdAt asc) {
    role,
    content
  }`;

  const messages = await client.fetch(query, { conversationId });
  if (!messages.length) return "⚠️ لا توجد رسائل لتلخيصها";

  const text = messages.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

  const prompt = `قم بتلخيص هذه المحادثة في نقاط رئيسية قصيرة مع الاحتفاظ بالمعنى:\n\n${text}`;
  return await fetchAI(prompt);
}
