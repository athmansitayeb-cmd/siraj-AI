// test.js
import Groq from "openai";

const openai = new Groq({
  apiKey: "40906a9e1ccaa40089a3481bec2e2f9d385b0a3575612a1826deef6f4fd1719eabf8eaf36fd88bbb9d58e540a4785bf83ea94a8fa441dd670b7f54099122e5cf"
});

async function run() {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }]
    });
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error(err);
  }
}

run();
