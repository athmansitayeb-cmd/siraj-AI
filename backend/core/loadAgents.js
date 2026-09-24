import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

let loaded = false;
let loadingPromise = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadAgents() {

  if (loaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {

    const agentsDir =
      path.join(
        __dirname,
        "agents"
      );

    if (!fs.existsSync(agentsDir)) {
      throw new Error(
        `[AGENTS] Directory not found: ${agentsDir}`
      );
    }

    const files =
      fs
        .readdirSync(agentsDir)
        .filter(file =>
          file.endsWith("Agent.js")
        )
        .sort();

    for (const file of files) {

      await import(
        pathToFileURL(
          path.join(
            agentsDir,
            file
          )
        ).href
      );

    }

    loaded = true;

    console.log(
      "[AGENTS LOADED]",
      files.length,
      "agents"
    );

  })();

  try {

    await loadingPromise;

  } catch (error) {

    loadingPromise = null;

    throw error;

  }

}
