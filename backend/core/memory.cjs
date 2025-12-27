const memory = { shortTerm: [], longTerm: {} };

function processMemory(state, message, intent) {
  memory.shortTerm.push({
    message,
    intent: intent.intent,
    time: Date.now()
  });

  if (!memory.longTerm[intent.intent]) {
    memory.longTerm[intent.intent] = 0;
  }
  memory.longTerm[intent.intent]++;
}

module.exports = { processMemory, memory };
