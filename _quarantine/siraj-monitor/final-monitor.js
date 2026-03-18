const axios = require("axios");
const { exec } = require("child_process");

const services = [
  { name: "siraj-backend", url: "http://localhost:9090/health", pm2: "siraj-backend" },
  { name: "siraj-dashboard", url: "http://localhost:3000/health", pm2: "siraj-dashboard" },
  { name: "siraj-brain", url: "http://localhost:3001/health", pm2: "siraj-brain" },
  { name: "siraj-watchdog", url: "http://localhost:3002/health", pm2: "siraj-watchdog" },
  { name: "siraj-all", url: "http://localhost:3003/health", pm2: "siraj-all" }
];

const checkServices = async () => {
  for (const s of services) {
    try {
      const r = await axios.get(s.url, { timeout: 3000 });
      console.log(`${s.name} جاهز ✅`, r.data);
    } catch (err) {
      console.log(`${s.name} غير متاح 🚨`, err.message);
      exec(`pm2 restart ${s.pm2}`, (error, stdout, stderr) => {
        if (error) console.error(`خطأ في إعادة تشغيل ${s.pm2}:`, error.message);
        else console.log(`${s.pm2} أعيد تشغيلها تلقائيًا 🔄`);
      });
    }
  }
};

// تشغيل أولي
checkServices();

// كرر كل 10 ثواني
setInterval(checkServices, 10000);

// إدارة الأخطاء
process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
process.on("unhandledRejection", (err) => console.error("Unhandled Rejection:", err));
