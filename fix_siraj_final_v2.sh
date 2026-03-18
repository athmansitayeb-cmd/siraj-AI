#!/bin/bash
set -e

# 🛠 إعادة تشغيل الكونتينرات
echo "🚀 إعادة تشغيل جميع الكونتينرات..."
docker compose down
docker compose up -d

# ⏳ الانتظار لتشغيل backend
echo "⏳ انتظر 5 ثواني لتشغيل backend..."
sleep 5

# 🔹 فحص حالة backend داخليًا (داخل السيرفر)
echo "🔹 فحص حالة backend داخليًا..."
INTERNAL_STATUS=$(curl -s http://127.0.0.1:5000/api/health)
echo "$INTERNAL_STATUS" | jq .

# 🔹 فحص حالة backend عبر HTTPS
echo "🔹 فحص حالة backend عبر HTTPS..."
EXTERNAL_STATUS=$(curl -s https://siraj.software/api/health)
echo "$EXTERNAL_STATUS" | jq .

# 🔹 إرسال رسالة اختبارية إلى chat API
TEST_MSG='{"text":"اختبار المرحلة النهائية"}'
echo "🔹 إرسال رسالة اختبارية إلى chat API..."
CHAT_RESPONSE=$(curl -s -X POST https://siraj.software/api/chat \
  -H "Content-Type: application/json" \
  -d "$TEST_MSG")
echo "$CHAT_RESPONSE" | jq .

# ✅ عرض حالة الذاكرة STM/MTM/LTM إذا موجودة
STM=$(echo "$CHAT_RESPONSE" | jq '.memory_size.STM // "غير متوفر"')
MTM=$(echo "$CHAT_RESPONSE" | jq '.memory_size.MTM // "غير متوفر"')
LTM=$(echo "$CHAT_RESPONSE" | jq '.memory_size.LTM // "غير متوفر"')
echo "💾 حالة الذاكرة: STM=$STM, MTM=$MTM, LTM=$LTM"

echo "✅ كل شيء جاهز!"
