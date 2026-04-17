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
    data.goals.push(msg.slice(0, 120));
  }

  // ================= STRUGGLES =================
  if (/اعاني|مشكل|تعبان|ضايع|قلق|خايف/.test(text)) {
    data.struggles.push(msg.slice(0, 120));
    data.lastState = msg;
  }

// ================= STATE DETECTION =================
if (/ضايع|ماعرف|مشتت/.test(text)) {
  data.lastState = "lost";
}

if (/خايف|قلق|متوتر/.test(text)) {
  data.lastState = "anxious";
}

if (/كسول|مافي طاقة|تعبان/.test(text)) {
  data.lastState = "low_energy";
}

if (/اريد التغيير|سأبدأ|سألتزم/.test(text)) {
  data.lastState = "motivated";
}

if (/لماذا يحدث لي|الحياة صعبة/.test(text)) {
  data.lastState = "victim_mode";
}

// ================= CHECKINS =================
if (/التزمت|صليت|بدأت|نفذت/.test(text)) {
  data.checkin = "progress";
}

if (/لم التزم|فشلت|ماقدرت/.test(text)) {
  data.checkin = "failed";
}

  // ================= HABITS =================
  if (/بدأت|التزمت|صليت|تركت/.test(text)) {
    data.habits.push(msg.slice(0, 120));
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
