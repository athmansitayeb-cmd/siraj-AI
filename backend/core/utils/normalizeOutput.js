export function normalizeOutput(res) {

  if (!res) {
    return {
      ok: false,
      text: "empty output",
      data: {},
      files: []
    };
  }

  if (typeof res === "string") {
    return {
      ok: true,
      text: res,
      data: {},
      files: []
    };
  }

return {
  ok: res.ok ?? true,

  text:
    res.text ||
    res.summary ||
    res.message ||
    "",

  data:
    res.data ||
    res.result ||
    {},

  files: res.files || [],

  tasks: res.tasks || [],

  intent: res.intent,

  complexity: res.complexity,

  architecture: res.architecture
};
}
