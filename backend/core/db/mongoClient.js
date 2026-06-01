import { MongoClient } from "mongodb";

let client;
let db;

export async function getDB() {

  if (db) return db;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing");
  }

  client = new MongoClient(process.env.MONGO_URI, {
    maxPoolSize: 10
  });

  await client.connect();

  db = client.db("siraj");

  console.log("[MONGO] connected");

  return db;
}
