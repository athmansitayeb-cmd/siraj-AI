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
      typeof input.text === "string"
        ? input.text
        : typeof payload.text === "string"
          ? payload.text
          : typeof payload.message === "string"
            ? payload.message
            : typeof payload.content === "string"
              ? payload.content
              : "",

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
