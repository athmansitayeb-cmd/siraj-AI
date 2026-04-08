import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function extractUserMemory(msg) {
  if (!msg) return null;

  const data = {
    goals: [],
    struggles: [],
    habits: [],
    lastState: ""
  };

  const text = msg.toLowerCase();

  // ================= GOALS =================
  if (/اريد|هدفي|اتمنى/.test(text)) {
    data.goals.push(msg);
  }

  // ================= STRUGGLES =================
  if (/اعاني|مشكل|تعبان|ضايع|قلق|خايف/.test(text)) {
    data.struggles.push(msg);
    data.lastState = msg;
  }

  // ================= HABITS =================
  if (/بدأت|التزمت|صليت|تركت/.test(text)) {
    data.habits.push(msg);
  }

  if (
    !data.goals.length &&
    !data.struggles.length &&
    !data.habits.length
  ) {
    return null;
  }

  return data;
}
