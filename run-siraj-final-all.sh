#!/bin/bash

BASE_DIR="/home/athman/siraj"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

FULL_LOG="$LOG_DIR/full.log"
PM2_LOG="$LOG_DIR/pm2.log"
NGROK_LOG="$LOG_DIR/ngrok.log"
GIT_LOG="$LOG_DIR/git_update.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] بدء تشغيل SIRAJ الكامل..." >> "$FULL_LOG"

cd "$BASE_DIR"
git fetch --all >> "$GIT_LOG" 2>&1
git reset --hard origin/main >> "$GIT_LOG" 2>&1

pm2 delete all >> "$PM2_LOG" 2>&1 || true

"$BASE_DIR/start-ngrok.sh" >> "$NGROK_LOG" 2>&1 &
sleep 2

pm2 start "$BASE_DIR/backend/server.js" --name backend >> "$PM2_LOG" 2>&1 || true
pm2 start "$BASE_DIR/Restart_All_Siraj.sh" --name Restart_All_Siraj >> "$PM2_LOG" 2>&1 || true

pm2 save >> "$PM2_LOG" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] جميع الخدمات تعمل. بدء المراقبة المستمرة..." >> "$FULL_LOG"

while true; do
    sleep 60
    pm2 resurrect >> "$PM2_LOG" 2>&1 || echo "[$(date '+%Y-%m-%d %H:%M:%S')] خطأ في PM2 Resurrect، تم تجاوزه." >> "$FULL_LOG"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] حالة الخدمات تم التحقق منها." >> "$FULL_LOG"
done
