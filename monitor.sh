#!/bin/bash
# ============================================
# SIRAJ Monitor & Auto-Restart Script
# ============================================

LOG_FILE="/opt/siraj/monitor.log"
DATE_NOW=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE_NOW] بدء فحص خدمات SIRAJ..." >> $LOG_FILE

# --- التحقق من Backend ---
if ! curl -s http://localhost:5000/api/health >/dev/null; then
    echo "[$DATE_NOW] Backend متوقف! إعادة التشغيل عبر PM2..." >> $LOG_FILE
    pm2 restart siraj-backend
else
    echo "[$DATE_NOW] Backend يعمل بشكل طبيعي." >> $LOG_FILE
fi

# --- التحقق من Frontend ---
if ! curl -s http://localhost:3000 >/dev/null; then
    echo "[$DATE_NOW] Frontend متوقف! إعادة التشغيل عبر PM2..." >> $LOG_FILE
    pm2 restart siraj-frontend
else
    echo "[$DATE_NOW] Frontend يعمل بشكل طبيعي." >> $LOG_FILE
fi

# --- حالة PM2 الحالية ---
pm2 list >> $LOG_FILE
echo "[$DATE_NOW] الفحص اكتمل." >> $LOG_FILE
echo "-------------------------------------------------" >> $LOG_FILE
