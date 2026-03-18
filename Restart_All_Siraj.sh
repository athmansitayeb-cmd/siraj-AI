#!/bin/bash
echo "🌐 بدء إعادة تشغيل جميع خدمات SIRAJ..."

# 1. إغلاق أي عملية على المنفذ 9090
echo "1. إغلاق أي عملية على المنفذ 9090..."
sudo fuser -k 9090/tcp

# 2. إيقاف وحذف جميع تطبيقات PM2 القديمة
echo "2. إيقاف وحذف جميع تطبيقات PM2 القديمة..."
pm2 stop all
pm2 delete all

# 3. تشغيل Backend
echo "3. تشغيل Backend..."
pm2 start ~/siraj/backend/server.js --name backend

# 4. تشغيل Dashboard
echo "4. تشغيل Dashboard..."
pm2 start ~/siraj/dashboard/server.js --name dashboard

# 5. تشغيل Scripts فقط إذا كان موجود
echo "5. تشغيل Scripts..."
if [ -f ~/siraj/scripts/server.js ]; then
  pm2 start ~/siraj/scripts/server.js --name scripts
else
  echo "⚠️ Script scripts/server.js غير موجود، تم تخطي التشغيل."
fi

# 6. عرض حالة PM2 بعد التشغيل
echo "6. عرض حالة PM2..."
pm2 ls

# 7. رابط ngrok (اختياري إذا مثبت ngrok)
if command -v jq >/dev/null 2>&1; then
  NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url')
  echo "🌐 رابط ngrok الحالي: $NGROK_URL"
fi

echo "✅ جميع خدمات SIRAJ جاهزة للعمل!"
