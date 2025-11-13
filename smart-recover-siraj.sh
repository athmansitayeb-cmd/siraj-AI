#!/bin/bash
BASE_DIR="$HOME/siraj"
echo "🔹 بدء التحقق من ملفات سراج..."

declare -A SERVICES=(
    ["siraj-brain"]="siraj-brain/index.js"
    ["siraj-backend"]="siraj-backend/index.js"
    ["siraj-dashboard"]="siraj-dashboard/server.js"
    ["siraj-watchdog"]="siraj-watchdog/index.js"
    ["siraj-monitor"]="siraj-monitor/index.js"
    ["guardian"]="monitor/guardian.js"
    ["siraj"]="siraj/index.js"
)

# تحقق واسترجاع الملفات المفقودة
for service in "${!SERVICES[@]}"; do
    FILE_PATH="${BASE_DIR}/${SERVICES[$service]}"
    if [ ! -f "$FILE_PATH" ]; then
        echo "⚠️  الملف مفقود: $FILE_PATH — محاولة استرجاعه من Git..."
        # هنا نضع أمر git لإعادة الملف من المستودع (يجب أن يكون المستودع معرف)
        if [ -d "$BASE_DIR/.git" ]; then
            git checkout -- "${SERVICES[$service]}"
            if [ -f "$FILE_PATH" ]; then
                echo "✅ تم استرجاع $service بنجاح."
            else
                echo "❌ فشل استرجاع $service. تحقق من المستودع."
            fi
        else
            echo "❌ لا يوجد مستودع Git. يجب وضع نسخة احتياطية للملف."
        fi
    fi
done

# تشغيل كل الخدمات المتاحة عبر PM2
echo "🔹 بدء تشغيل الخدمات..."
for service in "${!SERVICES[@]}"; do
    FILE_PATH="${BASE_DIR}/${SERVICES[$service]}"
    if [ -f "$FILE_PATH" ]; then
        echo "✅ تشغيل $service..."
        pm2 start "$FILE_PATH" --name "$service"
    fi
done

# حفظ حالة PM2
pm2 save
echo "🔹 انتهى التشغيل الذكي لسراج."
