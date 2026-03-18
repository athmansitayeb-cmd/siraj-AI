#!/bin/bash
set -e

echo "== SIRAJ Frontend Safe Deploy =="

FRONTEND_SRC="/opt/siraj/frontend-react"
NGINX_ROOT="/opt/siraj/frontend"
BUILD_DIR="$FRONTEND_SRC/build"
BACKUP_DIR="/opt/siraj/frontend_backup_$(date +%Y%m%d_%H%M%S)"

cd $FRONTEND_SRC

echo "[1/6] تنظيف الحزم"
rm -rf node_modules package-lock.json

echo "[2/6] تثبيت الحزم"
npm install

echo "[3/6] التأكد من react-scripts"
npm install react-scripts@5.0.1 --save

echo "[4/6] بناء React"
npx react-scripts build

if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ build غير موجود — إيقاف"
  exit 1
fi

echo "[5/6] نسخ احتياطي"
if [ -d "$NGINX_ROOT" ]; then
  mv $NGINX_ROOT $BACKUP_DIR
fi

mkdir -p $NGINX_ROOT
cp -r $BUILD_DIR/* $NGINX_ROOT/

echo "[6/6] إعادة تشغيل nginx"
nginx -t
systemctl restart nginx

echo "✅ النشر تم بنجاح"
echo "📦 النسخة السابقة محفوظة في:"
echo "$BACKUP_DIR"
