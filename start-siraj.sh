#!/bin/bash
# start-siraj.sh
# سكربت لفحص ملفات الخدمات وتشغيل PM2 تلقائيًا

# قائمة التطبيقات ومسارات سكربتاتها
declare -A apps
apps=(
  ["siraj-backend"]="siraj-backend/app.js"
  ["siraj-dashboard"]="siraj-dashboard/app.js"
  ["siraj-brain"]="siraj-brain/app.js"
  ["siraj-monitor"]="siraj-monitor/app.js"
  ["siraj-watchdog"]="siraj-watchdog/app.js"
  ["siraj-all"]="siraj-all/app.js"
)

# مسار المشروع
BASE_DIR="$HOME/siraj"
cd "$BASE_DIR" || { echo "لم أتمكن من الدخول للمجلد $BASE_DIR"; exit 1; }

# فحص الملفات
missing=0
for app in "${!apps[@]}"; do
  script="${apps[$app]}"
  if [ ! -f "$script" ]; then
    echo "❌ الملف مفقود: $script"
    missing=1
  fi
done

if [ $missing -eq 1 ]; then
  echo "يجب تصحيح الملفات المفقودة قبل التشغيل."
  exit 1
fi

echo "✅ جميع الملفات موجودة. بدء التشغيل..."

# حذف أي عمليات سابقة
pm2 delete all 2>/dev/null

# تشغيل جميع التطبيقات عبر PM2
cat > "$BASE_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    { name: "siraj-backend", script: "./siraj-backend/app.js", watch: true, autorestart: true, max_memory_restart: "200M", env: { NODE_ENV: "production" } },
    { name: "siraj-dashboard", script: "./siraj-dashboard/app.js", watch: true, autorestart: true, max_memory_restart: "200M", env: { NODE_ENV: "production" } },
    { name: "siraj-brain", script: "./siraj-brain/app.js", watch: true, autorestart: true, max_memory_restart: "250M", env: { NODE_ENV: "production" } },
    { name: "siraj-monitor", script: "./siraj-monitor/app.js", watch: true, autorestart: true, max_memory_restart: "150M", env: { NODE_ENV: "production" } },
    { name: "siraj-watchdog", script: "./siraj-watchdog/app.js", watch: true, autorestart: true, max_memory_restart: "150M", env: { NODE_ENV: "production" } },
    { name: "siraj-all", script: "./siraj-all/app.js", watch: true, autorestart: true, max_memory_restart: "300M", env: { NODE_ENV: "production" } }
  ]
};
EOF

pm2 start "$BASE_DIR/ecosystem.config.js"
pm2 save

# إعداد التشغيل التلقائي على systemd/WSL
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
pm2 save

echo "✅ جميع الخدمات تعمل الآن وسيتم تشغيلها تلقائيًا عند بدء WSL."
pm2 listdone
