import { knowledgeBase } from "./knowledge.js";

export function getIntent(input) {
  input = input.toLowerCase();

  if (knowledgeBase.greetings.some(word => input.includes(word))) {
    return { intent: "greeting", confidence: 0.99 };
  }

  if (knowledgeBase.farewells.some(word => input.includes(word))) {
    return { intent: "farewell", confidence: 0.99 };
  }

  return { intent: "unknown", confidence: 0.5 };
}
