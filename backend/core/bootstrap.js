import { loadAgents } from "./loadAgents.js";
import { loadTools } from "./loadTools.js";

export async function bootstrapCore() {
  await loadAgents();
  await loadTools();
}
