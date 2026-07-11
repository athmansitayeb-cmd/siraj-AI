export function normalizeAgentOutput(result) {

  if (!result) {
    return {
      ok: false,
      text: "",
      data: {},
      files: []
    };
  }

  if (typeof result === "string") {
    return {
      ok: true,
      text: result,
      data: {},
      files: []
    };
  }

  return {
    ...result,

    ok: result.ok ?? true,

    text:
      result.text ||
      result.summary ||
      result.message ||
      result.content ||
      "",

    data:
      result.data ||
      result.result ||
      {},

    files:
      result.files || []
  };

}
