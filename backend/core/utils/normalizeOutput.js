export function normalizeOutput(input) {

  if (!input) {
    return {
      ok: false,
      text: "",
      data: {},
      files: [],
      tasks: [],
      routes: [],
      pages: [],
      entities: [],
      architecture: {}
    };
  }

  if (typeof input === "string") {
    return {
      ok: true,
      text: input,
      data: {},
      files: [],
      tasks: [],
      routes: [],
      pages: [],
      entities: [],
      architecture: {}
    };
  }

  const payload = input.result || input.data || input;

  return {

    ...input,

    ok: input.ok ?? true,

    text:
      payload.text ??
      payload.summary ??
      payload.message ??
      payload.content ??
      "",

    data: payload,

    files:
      Array.isArray(payload.files)
        ? payload.files
        : Array.isArray(input.files)
          ? input.files
          : [],

    tasks:
      Array.isArray(payload.tasks)
        ? payload.tasks
        : [],

    routes:
      Array.isArray(payload.routes)
        ? payload.routes
        : [],

    pages:
      Array.isArray(payload.pages)
        ? payload.pages
        : [],

    entities:
      Array.isArray(payload.entities)
        ? payload.entities
        : [],

    architecture:
      payload.architecture || {},

    intent:
      payload.intent,

    complexity:
      payload.complexity

  };

}
