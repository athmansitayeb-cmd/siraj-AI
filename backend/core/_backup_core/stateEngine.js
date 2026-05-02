export function buildState(messages, msg) {
  const last = messages.slice(-6).map(m => m.content.toLowerCase());

  let pattern = "normal";

  if (last.filter(x => x === msg).length >= 2) pattern = "loop";
  else if (/فشلت|fail/.test(msg)) pattern = "failure";
  else if (/ضايع|lost/.test(msg)) pattern = "lost";
  else if (/تعبان|مافي طاقة/.test(msg)) pattern = "low_energy";

  const modeMap = {
    loop: "confront",
    failure: "diagnose",
    lost: "clarify",
    low_energy: "support",
    normal: "respond"
  };

  return {
    pattern,
    mode: modeMap[pattern]
  };
}
