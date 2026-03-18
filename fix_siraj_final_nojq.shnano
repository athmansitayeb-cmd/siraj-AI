#!/bin/bash
set -e

# 1️⃣ إعادة تشغيل الكونتينرات
echo "🚀 إعادة تشغيل جميع الكونتينرات..."
docker compose down
docker compose up -d

# 2️⃣ الانتظار لتشغيل backend
echo "⏳ انتظر 5 ثواني لتشغيل backend..."
sleep 5

# 3️⃣ فحص حالة backend داخليًا
echo "🔹 فحص حالة backend داخليًا..."
curl -s http://127.0.0.1:5000/api/health
echo

# 4️⃣ فحص حالة backend خارجيًا
echo "🔹 فحص حالة backend خارجيًا..."
curl -s https://siraj.software/api/health
echo

# 5️⃣ إرسال رسالة اختبارية
echo "🔹 إرسال رسالة اختبارية إلى chat API..."
curl -s -X POST https://siraj.software/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"اختبار المرحلة النهائية"}'
echo
