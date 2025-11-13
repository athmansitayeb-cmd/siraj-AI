#!/bin/bash
# =================================================
# سكريبت إعادة تشغيل SIRAJ بالكامل باستخدام PM2
# =================================================

echo "🔹 إيقاف جميع العمليات القديمة..."
pm2 stop all
pm2 delete all

echo "🔹 تنظيف السجلات القديمة..."
rm -rf ~/.pm2/logs/*

echo "🔹 الانتقال لمجلد المشروع..."
cd ~/siraj || { echo "❌ مجلد siraj غير موجود!"; exit 1; }

echo "🔹 تثبيت أي تبعيات Node.js (إذا لم تكن مثبتة)..."
npm install

echo "🔹 تشغيل كل الخدمات..."
pm2 start monitor/guardian.js --name guardian
pm2 start siraj-brain/index.js --name siraj-brain
pm2 start siraj-watchdog/index.js --name siraj-watchdog
pm2 start siraj-dashboard/server.js --name siraj-dashboard
pm2 start siraj-backend/index.js --name siraj-backend
pm2 start siraj-monitor/index.js --name siraj-monitor
pm2 start siraj/index.js --name siraj

echo "🔹 حفظ الحالة عند إعادة التشغيل..."
pm2 save

echo "🔹 إظهار حالة جميع العمليات..."
pm2 status
