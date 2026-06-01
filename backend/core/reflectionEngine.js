import { runAgent } from "./agentRouter.js";

// ================= REFLECTION LOOP =================
export async function reflectionLoop({
  input,
  output,
  maxRetries = 2,
  context = {}
}) {

  let currentOutput = output;

  for (let i = 0; i < maxRetries; i++) {

    // ================= CRITIC =================
    const critique = await runAgent({
      agent: "critic",
      input: currentOutput,
      context
    });

    // accepted
    if (critique.verdict === "acceptable") {

      return {
        ok: true,
        accepted: true,
        retries: i,
        output: currentOutput,
        critique
      };

    }

    // ================= RETRY =================
    currentOutput = {
      ...currentOutput,
      reflection: `Retry attempt ${i + 1}`
    };

  }

  return {
    ok: false,
    accepted: false,
    output: currentOutput
  };
}
