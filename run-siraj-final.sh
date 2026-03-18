#!/bin/bash

--- إعداد المجلدات والسجلات ---

BASE_DIR="/home/athman/siraj"
LOG_DIR="$BASE_DIR/logs"
mkdir -p "$LOG_DIR"

--- تحديث المشروع من GitHub ---

echo "🔄 تحديث المشروع من GitHub..." | tee -a "$LOG_DIR/update.log"
git -C "$BASE_DIR" pull origin main >> "$LOG_DIR/update.log" 2>&1 || echo "⚠️ فشل التحديث من GitHub" | tee -a "$LOG_DIR/update.log"

--- إغلاق أي عملية على المنفذ 9090 ---

echo "1. إغلاق أي عملية على المنفذ 9090..." | tee -a "$LOG_DIR/port.log"
PID=$(lsof -ti:9090)
if [ -n "$PID" ]; then
kill -9 $PID
echo "✔ تم إغلاق PID $PID" | tee -a "$LOG_DIR/port.log"
else
echo "✔ لا توجد عمليات على المنفذ 9090" | tee -a "$LOG_DIR/port.log"
fi

--- حذف أي تطبيقات PM2 قديمة ---

echo "2. حذف تطبيقات PM2 القديمة..." | tee -a "$LOG_DIR/pm2_cleanup.log"
pm2 delete all >> "$LOG_DIR/pm2_cleanup.log" 2>&1 || true

--- تشغيل Ngrok في الخلفية ---

echo "3. تشغيل Ngrok..." | tee -a "$LOG_DIR/ngrok.log"
$BASE_DIR/start-ngrok.sh >> "$LOG_DIR/ngrok.log" 2>&1 &

--- تشغيل Backend وRestart_All_Siraj عبر PM2 ---

echo "4. تشغيل كل خدمات SIRAJ..." | tee -a "$LOG_DIR/pm2.log"
pm2 start $BASE_DIR/backend/server.js --name backend >> "$LOG_DIR/backend.log" 2>&1
pm2 start $BASE_DIR/Restart_All_Siraj.sh --name Restart_All_Siraj >> "$LOG_DIR/restart_all.log" 2>&1

--- حفظ حالة PM2 لتشغيل تلقائي بعد إعادة التشغيل ---

pm2 save >> "$LOG_DIR/pm2_save.log" 2>&1

--- التحقق من حالة PM2 ---

echo "5. عرض حالة PM2..." | tee -a "$LOG_DIR/pm2_status.log"
pm2 ls | tee -a "$LOG_DIR/pm2_status.log"

--- التحقق من العمليات على المنفذ 9090 ---

echo "6. التحقق من العمليات على المنفذ 9090..." | tee -a "$LOG_DIR/port_status.log"
lsof -i:9090 | tee -a "$LOG_DIR/port_status.log"

echo "✅ جميع خدمات سِراج جاهزة وتعمل تلقائيًا!" | tee -a "$LOG_DIR/final.log"
