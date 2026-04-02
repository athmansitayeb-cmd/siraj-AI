import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractUserMemory(msg) {
  try {
    const prompt = `
You are a memory extraction engine.

Extract ONLY useful long-term user information.

Return JSON only:

{
  "facts": [],
  "preferences": {},
  "profile": {}
}

Rules:
- Ignore small talk
- Ignore temporary info
- Keep it minimal
- No explanation

User message:
"${msg}"
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt }
      ],
      temperature: 0,
      max_tokens: 200
    });

    const text = completion.choices[0].message.content;

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) return null;

    try {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch (e) {
      return null;
    }

  } catch (e) {
    console.error("[MEMORY EXTRACT ERROR]", e);
    return null;
  }
}
