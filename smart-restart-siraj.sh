#!/bin/bash
# =================================================
# سكريبت ذكي لإدارة SIRAJ باستخدام PM2
# =================================================

SIRAJ_DIR=~/siraj

# قائمة الخدمات مع مسارها النسبي
declare -A SERVICES=(
    ["guardian"]="monitor/guardian.js"
    ["siraj-brain"]="siraj-brain/index.js"
    ["siraj-watchdog"]="siraj-watchdog/index.js"
    ["siraj-dashboard"]="siraj-dashboard/server.js"
    ["siraj-backend"]="siraj-backend/index.js"
    ["siraj-monitor"]="siraj-monitor/index.js"
    ["siraj"]="siraj/index.js"
)

echo "🔹 إيقاف كل عمليات PM2 القديمة..."
pm2 stop all 2>/dev/null
pm2 delete all 2>/dev/null

echo "🔹 تنظيف السجلات القديمة..."
rm -rf ~/.pm2/logs/*

cd "$SIRAJ_DIR" || { echo "❌ مجلد $SIRAJ_DIR غير موجود!"; exit 1; }

echo "🔹 التحقق من الملفات وبدء الخدمات..."
for name in "${!SERVICES[@]}"; do
    path="${SERVICES[$name]}"
    if [ -f "$path" ]; then
        echo "✅ تشغيل $name ($path)"
        pm2 start "$path" --name "$name"
    else
        echo "⚠️  الملف مفقود: $path — لن يتم تشغيل $name"
    fi
done

echo "🔹 حفظ حالة PM2..."
pm2 save

echo "🔹 حالة جميع العمليات:"
pm2 status
