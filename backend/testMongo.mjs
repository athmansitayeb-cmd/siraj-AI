// testMongo.mjs
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000, // مهلة 10 ثواني للاتصال
});

(async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB Atlas connected!");
  } catch (e) {
    console.error("❌ Connection failed:", e);
  } finally {
    await client.close();
    process.exit();
  }
})();
