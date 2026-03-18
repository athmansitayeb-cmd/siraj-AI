#!/bin/bash
# ===================== SIRAJ Final Legendary Setup =====================

echo "🚀 إعداد SIRAJ الأسطوري... انتظر قليلاً"

# تحديث النظام وتنصيب Node.js و PM2 إذا لم تكن موجودة
command -v node >/dev/null 2>&1 || { echo "تنصيب Node.js..."; sudo apt update && sudo apt install -y nodejs npm; }
command -v pm2 >/dev/null 2>&1 || { echo "تنصيب PM2..."; sudo npm install -g pm2; }

# إنشاء مجلدات لكل خدمة
mkdir -p ~/siraj/{siraj-backend,siraj-dashboard,siraj-brain,siraj-monitor,siraj-watchdog,siraj-all}

# ===================== Backend =====================
cat > ~/siraj/siraj-backend/app.js << 'EOF'
const express = require("express");
const app = express();
const port = 9090;

app.get("/", (req, res) => res.send("siraj-backend يعمل بشكل أسطوري!"));
app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ Backend جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-backend يعمل على المنفذ ${port}`));
EOF

# ===================== Dashboard =====================
cat > ~/siraj/siraj-dashboard/app.js << 'EOF'
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("siraj-dashboard يعمل بشكل أسطوري!"));
app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ Dashboard جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-dashboard يعمل على المنفذ ${port}`));
EOF

# ===================== Brain =====================
cat > ~/siraj/siraj-brain/app.js << 'EOF'
const express = require("express");
const app = express();
const port = 3001;

app.get("/", (req, res) => res.send("siraj-brain يعمل بشكل أسطوري!"));
app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ Brain جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-brain يعمل على المنفذ ${port}`));
EOF

# ===================== Watchdog =====================
cat > ~/siraj/siraj-watchdog/app.js << 'EOF'
const express = require("express");
const app = express();
const port = 3002;

app.get("/", (req, res) => res.send("siraj-watchdog يعمل بشكل أسطوري!"));
app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ Watchdog جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-watchdog يعمل على المنفذ ${port}`));
EOF

# ===================== All =====================
cat > ~/siraj/siraj-all/app.js << 'EOF'
const express = require("express");
const app = express();
const port = 3003;

app.get("/", (req, res) => res.send("siraj-all يعمل بشكل أسطوري!"));
app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ All جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-all يعمل على المنفذ ${port}`));
EOF

# ===================== Monitor =====================
cat > ~/siraj/siraj-monitor/app.js << 'EOF'
const express = require("express");
const axios = require("axios");
const app = express();
const port = 3004;

const services = [
    { name: "backend", url: "http://localhost:9090/health" },
    { name: "dashboard", url: "http://localhost:3000/health" },
    { name: "brain", url: "http://localhost:3001/health" },
    { name: "watchdog", url: "http://localhost:3002/health" },
    { name: "all", url: "http://localhost:3003/health" }
];

setInterval(async () => {
    for (const s of services) {
        try {
            const r = await axios.get(s.url);
            console.log(`${s.name}: ${r.data.status}`);
        } catch (err) {
            console.error(`${s.name} غير متاح!`);
        }
    }
}, 10000);

app.get("/health", (req, res) => res.json({ status: "UP", message: "SIRAJ Monitor جاهز" }));
app.get("/status", (req, res) => res.json({ status: "OK", uptime: process.uptime() }));

app.listen(port, () => console.log(`siraj-monitor يعمل على المنفذ ${port}`));
EOF

# ===================== تشغيل كل الخدمات عبر PM2 =====================
echo "تشغيل كل الخدمات عبر PM2..."
pm2 start ~/siraj/siraj-backend/app.js --name siraj-backend
pm2 start ~/siraj/siraj-dashboard/app.js --name siraj-dashboard
pm2 start ~/siraj/siraj-brain/app.js --name siraj-brain
pm2 start ~/siraj/siraj-watchdog/app.js --name siraj-watchdog
pm2 start ~/siraj/siraj-all/app.js --name siraj-all
pm2 start ~/siraj/siraj-monitor/app.js --name siraj-monitor

# حفظ حالة PM2 وإعداد التشغيل التلقائي
pm2 save
pm2 startup -u $USER --hp $HOME

# تثبيت log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

echo "✅ SIRAJ جاهز! تحقق عبر:"
echo "Backend Health: curl http://localhost:9090/health"
echo "Dashboard Health: curl http://localhost:3000/health"
echo "Brain Health: curl http://localhost:3001/health"
echo "Watchdog Health: curl http://localhost:3002/health"
echo "All Health: curl http://localhost:3003/health"
echo "Monitor Health: curl http://localhost:3004/health"
