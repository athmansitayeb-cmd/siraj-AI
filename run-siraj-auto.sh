#!/bin/bash
LOG_DIR="/home/athman/siraj/logs"
mkdir -p "$LOG_DIR"

# تحديث PM2 وحذف أي عمليات قديمة
pm2 delete all >> "$LOG_DIR/pm2_cleanup.log" 2>&1 || true

# تشغيل Ngrok في الخلفية مع سجل كامل
/home/athman/siraj/start-ngrok.sh >> "$LOG_DIR/ngrok.log" 2>&1 &

# تشغيل كل خدمات SIRAJ باستخدام PM2
pm2 start /home/athman/siraj/backend/server.js --name backend >> "$LOG_DIR/backend.log" 2>&1
pm2 start /home/athman/siraj/Restart_All_Siraj.sh --name Restart_All_Siraj >> "$LOG_DIR/restart_all.log" 2>&1

# حفظ حالة PM2 لتشغيل تلقائي بعد أي إعادة تشغيل
pm2 save >> "$LOG_DIR/pm2_save.log" 2>&1
