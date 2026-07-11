export function stripMarkdown(text) {

  if (!text) return "";

  return String(text)
    .replace(/^```[\w-]*\s*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}
