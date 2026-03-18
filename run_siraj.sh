#!/bin/bash
# 🟢 تشغيل سيراج بالكامل بنقرة واحدة

PROJECT_DIR=~/siraj
cd "$PROJECT_DIR" || exit 1

# --- تشغيل ngrok إذا موجود ---
if command -v ngrok >/dev/null 2>&1; then
    if ! nc -z 127.0.0.1 4040 >/dev/null 2>&1; then
        echo "🌐 بدء ngrok..."
        nohup bash "$PROJECT_DIR/start-ngrok.sh" >/dev/null 2>&1 &
        sleep 2
    fi
    [ -f "$PROJECT_DIR/url.txt" ] && echo "🌐 رابط ngrok الحالي: $(cat $PROJECT_DIR/url.txt)"
fi

# --- تشغيل PM2 لجميع الخدمات ---
if command -v pm2 >/dev/null 2>&1; then
    echo "🚀 تشغيل PM2..."
    pm2 start ecosystem.config.js --update-env
    pm2 save
    echo "✅ PM2 جاهز وجميع الخدمات تعمل"
fi

# --- فتح واجهة الويب ---
if command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 فتح واجهة الويب..."
    xdg-open "$PROJECT_DIR/frontend/index.html" >/dev/null 2>&1 &
fi

echo -e "\033[1;32m🟢 سيراج بالكامل جاهز للعمل! 🟢\033[0m"
