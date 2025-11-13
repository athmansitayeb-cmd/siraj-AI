#!/bin/bash
# إعادة تشغيل الخدمة
systemctl --user restart start-siraj.service
sleep 10
# طباعة رابط ngrok الحالي
if [ -f "/home/athman/siraj/url.txt" ]; then
    URL=$(cat "/home/athman/siraj/url.txt")
    echo -e "\033[1;32m🌐 رابط ngrok الحالي: $URL\033[0m"
fi
# إظهار لوحة المونيتور
echo -e "\033[1;34m🔹 افتح لوحة المونيتور: http://localhost:9092\033[0m"
# عرض قائمة PM2 وبدء المونيتور
pm2 list
pm2 monit
