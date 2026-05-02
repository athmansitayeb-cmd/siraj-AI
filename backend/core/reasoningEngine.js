export function reasonDecision({ state, intent, focus, risk }) {

  let mode = "respond";
  const reasons = [];

  if (state === "lost") {
    mode = "clarify";
    reasons.push("lost state");
  }

  if (state === "victim_mode") {
    mode = "reframe";
    reasons.push("victim thinking");
  }

  if (intent === "fix") {
    mode = "diagnose";
  }

  if (state === "motivated") {
    mode = "respond"; // ❗ مهم: لا force push
  }

  return { mode, reasons };
}
