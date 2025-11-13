#!/bin/bash
# إعادة تشغيل الخدمة بصمت
systemctl --user restart start-siraj.service >/dev/null 2>&1
sleep 10
# طباعة رابط ngrok الحالي
if [ -f "/home/athman/siraj/url.txt" ]; then
    URL=$(cat "/home/athman/siraj/url.txt")
    echo -e "\033[1;32m🌐 رابط ngrok الحالي: $URL\033[0m"
fi
# إشعار بلوحة المونيتور
echo -e "\033[1;34m🔹 لوحة المونيتور: http://localhost:9092\033[0m"
