export function updateFeedback(memory, msg, response) {

  if (!memory.feedback) memory.feedback = [];

  memory.feedback.push({
    input: msg,
    output: response,
    timestamp: Date.now()
  });

  memory.feedback = memory.feedback.slice(-30);

  return memory;
}
