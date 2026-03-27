import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function testConnection() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully!");
    const databases = await client.db().admin().listDatabases();
    console.log("Databases:", databases.databases.map(db => db.name));
  } catch (error) {
    console.error("❌ Connection failed:", error);
  } finally {
    await client.close();
  }
}

testConnection();
