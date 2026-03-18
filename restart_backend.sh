#!/bin/bash

# اسم التطبيق
APP_NAME="backend"
APP_PATH="$HOME/siraj/backend/server.js"
PORT=9090

echo "1. إغلاق أي عملية على المنفذ $PORT..."
sudo fuser -k $PORT/tcp 2>/dev/null

echo "2. إيقاف وحذف جميع تطبيقات PM2 القديمة..."
pm2 stop all
pm2 delete all

echo "3. تشغيل backend من جديد..."
pm2 start $APP_PATH --name $APP_NAME

echo "4. عرض حالة PM2..."
pm2 ls

echo "5. التحقق من العمليات على المنفذ $PORT..."
sudo lsof -i :$PORT
