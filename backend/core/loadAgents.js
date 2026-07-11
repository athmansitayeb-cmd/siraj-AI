import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

let loaded = false;

export async function loadAgents() {

  if (loaded) {
    return;
  }

  const agentsDir = path.join(
    process.cwd(),
    "core",
    "agents"
  );

  const files = fs
    .readdirSync(agentsDir)
    .filter(file => file.endsWith("Agent.js"));

  for (const file of files) {

    await import(
      pathToFileURL(
        path.join(agentsDir, file)
      ).href
    );

  }

  loaded = true;

  console.log(
    "[AGENTS LOADED]",
    files.length,
    "agents"
  );

}
