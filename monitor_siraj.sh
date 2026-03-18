#!/bin/bash

# مسار المشروع
PROJECT_DIR="$HOME/siraj/backend"
APP_NAME="siraj"
LOG_FILE="$HOME/siraj/siraj_monitor.log"

# تاريخ ووقت الآن
NOW=$(date '+%Y-%m-%d %H:%M:%S')

echo "$NOW: التحقق من حالة $APP_NAME..." >> "$LOG_FILE"

# تحقق إذا كانت العملية موجودة في PM2
if pm2 list | grep -q "$APP_NAME"; then
    STATUS=$(pm2 status "$APP_NAME" | grep "$APP_NAME" | awk '{print $10}')
    if [ "$STATUS" != "online" ]; then
        echo "$NOW: $APP_NAME متوقف، إعادة التشغيل..." >> "$LOG_FILE"
        cd "$PROJECT_DIR" || exit
        pm2 restart "$APP_NAME" --update-env
        echo "$NOW: $APP_NAME تمت إعادة التشغيل." >> "$LOG_FILE"
    else
        echo "$NOW: $APP_NAME يعمل بشكل طبيعي." >> "$LOG_FILE"
    fi
else
    echo "$NOW: $APP_NAME غير موجود في PM2، تشغيله الآن..." >> "$LOG_FILE"
    cd "$PROJECT_DIR" || exit
    pm2 start index.cjs --name "$APP_NAME"
    echo "$NOW: $APP_NAME تم تشغيله." >> "$LOG_FILE"
fi
