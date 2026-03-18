#!/bin/bash
set -e

echo "🚀 إعادة تشغيل جميع الكونتينرات..."
docker compose down
docker compose up -d

echo "⏳ انتظر 5 ثواني لتشغيل backend..."
sleep 5

echo "🔹 فحص حالة backend داخليًا..."
docker exec -it siraj-backend-1 curl -s http://127.0.0.1:5000/api/health | jq .

echo "🔹 فحص حالة backend عبر HTTPS..."
curl -s https://siraj.software/api/health | jq .

echo "🔹 إرسال رسالة اختبارية إلى chat API..."
response=$(curl -s -X POST https://siraj.software/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"اختبار المرحلة النهائية"}')

echo "$response" | jq .

echo "🔹 عرض حالة الذاكرة الحالية في backend:"
docker exec -it siraj-backend-1 cat /app/frontend/siraj-backend/memory_v10.json | jq .

echo "✅ كل شيء جاهز! الذاكرة محدثة ويمكنك متابعة STM, MTM, LTM."
