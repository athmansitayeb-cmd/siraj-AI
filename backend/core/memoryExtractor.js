import { groq } from "./groqClient.js";


export async function extractUserMemory(msg) {
  if (!msg || msg.length < 20) return null;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 250,
      messages: [
        {
          role: "system",
          content: `
You are a strict memory extractor.

Return ONLY valid JSON. No markdown. No explanations.

Schema:
{
  "goals": [],
  "struggles": [],
  "habits": [],
  "lastState": "",
  "checkin": ""
}

Rules:
- goals: long-term user intentions
- struggles: blockers / problems
- habits: repeated behaviors
- lastState: one of [lost, anxious, low_energy, motivated, victim_mode]
- checkin: progress | failed | ""

If nothing is found, return empty arrays and empty strings.
`
        },
        {
          role: "user",
          content: msg
        }
      ]
    });

    let text = completion?.choices?.[0]?.message?.content || "";

    // ================= CLEAN OUTPUT =================
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    if (!text) return null;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("[MEMORY PARSE FAIL RAW]", text);
      return null;
    }

    if (!parsed || typeof parsed !== "object") return null;

    return {
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      struggles: Array.isArray(parsed.struggles) ? parsed.struggles : [],
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      lastState: typeof parsed.lastState === "string" ? parsed.lastState : "",
      checkin: typeof parsed.checkin === "string" ? parsed.checkin : ""
    };

  } catch (e) {
    console.error("[MEMORY EXTRACT FAIL]", e);
    return null;
  }
}
