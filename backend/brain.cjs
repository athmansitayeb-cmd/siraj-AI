// brain.cjs
const { getIntent } = require("./core/intent.cjs");
const { state } = require("./core/state.cjs");
const { decide } = require("./core/decision.cjs");
const { processMemory } = require("./core/memory.cjs");
const { processNLP } = require("./core/nlp.cjs");
const { applyQuranicHeart } = require("./core/quranicHeart.cjs");

async function processInput(message) {
  // 1️⃣ NLP أولاً
  const nlp = processNLP(message);

  // 2️⃣ Intent يشتغل على tokens فقط
  const intent = getIntent(nlp.tokens);

  // 3️⃣ Memory
  processMemory(state, message, intent);

  // 4️⃣ Decision
  const decision = decide(intent, state);

  // 5️⃣ Quranic Heart
  const heart = applyQuranicHeart(message, intent, state);

  return {
    input: message,
    nlp,
    intent,
    decision,
    heart,
    memory: {
      shortTerm: state?.memory?.shortTerm?.length ?? 0,
      longTermKeys: Object.keys(state?.memory?.longTerm ?? {})
    }
  };
}

module.exports = { processInput };
