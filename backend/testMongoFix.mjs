import 'dotenv/config';
import { MongoClient } from 'mongodb';

// استخدم URI بدون +srv لتجنب مشاكل SRV/TLS
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  tls: true,  // إجبار الاتصال المشفر
  tlsAllowInvalidCertificates: false, // لا تتجاهل الشهادات
  serverSelectionTimeoutMS: 10000,    // مهلة محاولة الاتصال
});

(async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB Atlas connected successfully!");
    
    // اختبار قاعدة البيانات
    const db = client.db("siraj");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

  } catch (e) {
    console.error("❌ Connection failed:", e);
  } finally {
    await client.close();
    process.exit();
  }
})();
