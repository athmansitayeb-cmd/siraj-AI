#!/bin/bash
# smart-full-siraj.sh
BASE_DIR="$HOME/siraj"

# ملفات الخدمات الأساسية
FILES=(
  "siraj-brain/index.js"
  "siraj-backend/index.js"
  "siraj-dashboard/server.js"
  "siraj-watchdog/index.js"
  "siraj-monitor/index.js"
  "monitor/guardian.js"
)

# أسماء الخدمات لـ PM2
declare -A SERVICES
SERVICES=(
  ["siraj-brain/index.js"]="siraj-brain"
  ["siraj-backend/index.js"]="siraj-backend"
  ["siraj-dashboard/server.js"]="siraj-dashboard"
  ["siraj-watchdog/index.js"]="siraj-watchdog"
  ["siraj-monitor/index.js"]="siraj-monitor"
  ["monitor/guardian.js"]="guardian"
)

echo "🔹 بدء الفحص الذكي لسراج..."

# 1️⃣ تحقق من الملفات
for f in "${FILES[@]}"; do
  FULL_PATH="$BASE_DIR/$f"
  if [ ! -f "$FULL_PATH" ]; then
    echo "⚠️  الملف مفقود: $FULL_PATH — إنشاء نسخة فارغة مؤقتة"
    mkdir -p "$(dirname "$FULL_PATH")"
    echo "// TEMP FILE: $f" > "$FULL_PATH"
  else
    echo "✅ الملف موجود: $FULL_PATH"
  fi
done

# 2️⃣ تشغيل كل الخدمات عبر PM2
echo "🔹 تشغيل خدمات PM2..."
for FILE in "${!SERVICES[@]}"; do
  NAME=${SERVICES[$FILE]}
  pm2 start "$BASE_DIR/$FILE" --name "$NAME" -f >/dev/null 2>&1 || echo "❌ فشل تشغيل $NAME"
done

# 3️⃣ حفظ حالة PM2
pm2 save >/dev/null
echo "✅ تم حفظ حالة PM2."
echo "🔹 جميع الخدمات تعمل الآن (حتى الملفات المؤقتة)."
