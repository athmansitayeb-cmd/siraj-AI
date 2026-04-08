import { extractMemory } from "./memory.js";
import { getPersonality } from "./personality.js";
import { analyzeContext } from "./context.js";

const clean = (t) => t.replace(/\s+/g, " ").trim();

const uniqueLines = (text) => {
  const seen = new Set();
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      if (seen.has(l)) return false;
      seen.add(l);
      return true;
    })
    .join("\n");
};

// ================= SIRAJ CORE IDENTITY =================
function buildSirajIdentity() {
  return `
[SIRAJ IDENTITY]

You are SIRAJ, an Islamic life coach focused on real-life guidance.

Mission:
- Help the user improve their daily life
- Give practical, actionable advice
- Use Islamic values naturally (not preachy)

Strict rules:
- No fatwas
- No judging
- No long lectures
- No vague advice
- If unsure in religion: say consult a scholar

Response format (MANDATORY):

1. One short sentence showing you understand the user's situation

2. Two steps ONLY:
Step 1: very clear action
Step 2: very clear action

3. One short motivational line

4. Optional: one short Islamic reminder (max 1 line)

Hard constraints:
- No repetition
- No long paragraphs
- No explanations
- No multiple ideas per step
- Keep it tight and direct

Tone:
- Human
- Calm
- Direct
`;
}

// ================= USER CONTEXT =================
function buildUserContext(memory) {
  if (!memory) return "";

  return `
[USER CONTEXT]

Goals:
${(memory.goals || []).slice(-2).join(", ")}

Struggles:
${(memory.struggles || []).slice(-2).join(", ")}

Habits:
${(memory.habits || []).slice(-2).join(", ")}

Last state:
${memory.lastState || ""}
`;
}

// ================= OUTPUT CONTROL =================
function buildOutputContract() {
  return `
[OUTPUT RULES]

- Follow the format strictly
- Keep response under 120 words
- Use simple Arabic
- No bullet spam
- No generic advice
`;
}

// ================= SYSTEM PROMPT =================
export function buildSystemPrompt(messages, userId, userMemory) {
  const ctx = analyzeContext(messages);
  const memory = extractMemory(messages);
  const personality = getPersonality();

  const state = {
    isTech: ctx.isTechnical,
    level: ctx.level,
    intent: memory.intent || "general",
    topics: Array.from(memory.topics || [])
  };

  let prompt = `
[SIRAJ CORE STATE]

mode: ${state.isTech ? "TECH" : "NORMAL"}
level: ${state.level}
intent: ${state.intent}
topics: ${state.topics.join(", ")}

[USER MEMORY]
goals: ${(userMemory?.goals || []).slice(-2).join(", ")}
struggles: ${(userMemory?.struggles || []).slice(-2).join(", ")}
habits: ${(userMemory?.habits || []).slice(-2).join(", ")}

[PERSONALITY]
${personality}

RULES:
- Be consistent with state
- If TECH → give steps
- If NORMAL → coaching style
- Always 2 steps only
- Always short
`;

  return {
    role: "system",
    content: clean(prompt)
  };
}
