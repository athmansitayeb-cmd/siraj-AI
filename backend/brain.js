import { getIntent } from "./core/intent.js";
import { decide } from "./core/decision.js";
import { state } from "./core/state.js";
import { quranicHeart } from "./core/quranicHeart.js";

export async function processInput(input) {
  const intentData = getIntent(input);
  const action = decide(intentData.intent, state);

  // القلب المستمد من القرآن
  const heartResponse = quranicHeart(intentData.intent);

  state.lastInput = input;
  state.lastIntent = intentData.intent;

  return {
    input,
    intent: intentData,
    action,
    heart: heartResponse,
    state
  };
}
