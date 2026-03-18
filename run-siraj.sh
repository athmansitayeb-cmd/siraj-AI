#!/bin/bash

# ===============================
# SIRAJ Unified Startup Script
# ===============================

# تحديث النظام وتثبيت dependencies الأساسية
sudo apt update && sudo apt install -y \
  build-essential clang cmake ninja-build pkg-config \
  libgtk-3-dev liblzma-dev libpulse-dev libasound2-dev \
  libx11-dev libxcomposite-dev libxcursor-dev libxdamage-dev \
  libxext-dev libxi-dev libxrandr-dev libxrender-dev libxinerama-dev \
  libgl1-mesa-dev \
  libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev \
  curl git

# إصلاح مشاكل node/npm إذا كانت موجودة
sudo apt remove nodejs npm -y 2>/dev/null
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تأكد من النسخ
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# الانتقال لمجلد المشروع
cd ~/siraj

# تنظيف React وFlutter إذا كانت موجودة
[[ -d frontend-react ]] && cd frontend-react && npm install && cd ..
[[ -d frontend-flutter ]] && flutter clean && flutter pub get

# إزالة أي عمليات PM2 سابقة لتجنب تعارض
pm2 delete all 2>/dev/null

# ===============================
# تشغيل Backend
# ===============================
if [[ -f backend/server.js ]]; then
  pm2 start backend/server.js --name backend
  echo "✅ Backend running on port 9090"
else
  echo "⚠️ Backend missing (server.js not found)"
fi

# ===============================
# تشغيل Dashboard React
# ===============================
if [[ -d frontend-react ]]; then
  cd frontend-react
  npm install
  pm2 start npm --name dashboard -- start
  cd ..
  echo "✅ Dashboard React running on port 3000"
else
  echo "⚠️ Dashboard React folder missing"
fi

# ===============================
# تشغيل Brain و Monitor إذا موجودين
# ===============================
if [[ -f brain/brain.js ]]; then
  pm2 start brain/brain.js --name brain
fi

if [[ -f monitor/monitor.js ]]; then
  pm2 start monitor/monitor.js --name monitor
fi

# ===============================
# قائمة العمليات النهائية
# ===============================
pm2 list

echo "🚀 All available services are launched."
echo "Dashboard: http://localhost:3000"
echo "Backend API: http://localhost:9090/api/health"
