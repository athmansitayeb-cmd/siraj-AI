import { createClient } from "@sanity/client";

let client = null;

export function getSanityClient() {
  if (client) return client;

  if (!process.env.SANITY_PROJECT_ID) {
    throw new Error("SANITY_PROJECT_ID missing");
  }

  client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: "2023-03-23",
    useCdn: false,
    token: process.env.SANITY_API_TOKEN,
  });

  return client;
}

export default {
  fetch: (...args) => getSanityClient().fetch(...args),
  create: (...args) => getSanityClient().create(...args),
};
