#!/bin/bash
# ===========================================================
# SIRAJ Advanced Deployment Script
# ===========================================================

set -e
PROJECT_DIR="/opt/siraj"
FRONTEND_DIR="$PROJECT_DIR/frontend-react"
FRONTEND_NGINX_HTML="$PROJECT_DIR/frontend/nginx/html"
BACKEND_PM2_NAME="siraj-backend"
DOMAIN="siraj.software"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo ">> بدء نشر مشروع SIRAJ Advanced"

# ===============================
# 1. إنشاء نسخة احتياطية
# ===============================
echo ">> إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجود"
mkdir -p $BACKUP_DIR

echo ">> نسخ Frontend القديم إلى النسخ الاحتياطية"
if [ -d "$FRONTEND_NGINX_HTML" ] && [ "$(ls -A $FRONTEND_NGINX_HTML)" ]; then
    tar -czf "$BACKUP_DIR/frontend_$TIMESTAMP.tar.gz" -C "$FRONTEND_NGINX_HTML" .
    echo ">> تم نسخ Frontend القديم"
fi

echo ">> نسخ Backend القديم إلى النسخ الاحتياطية"
if [ -d "$PROJECT_DIR/backend" ]; then
    tar -czf "$BACKUP_DIR/backend_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR/backend" .
    echo ">> تم نسخ Backend القديم"
fi

# ===============================
# 2. تحديث Node وNPM
# ===============================
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo ">> استخدام Node $(node -v) و NPM $(npm -v)"

# ===============================
# 3. تثبيت Dependencies Frontend وتحديثها
# ===============================
cd $FRONTEND_DIR
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm audit fix || true
npm audit fix --force || true

# ===============================
# 4. بناء Frontend
# ===============================
echo ">> بناء نسخة Production للـ Frontend"
npm run build

# ===============================
# 5. نشر Frontend إلى Nginx
# ===============================
mkdir -p $FRONTEND_NGINX_HTML
rm -rf $FRONTEND_NGINX_HTML/*
cp -r build/* $FRONTEND_NGINX_HTML/
chown -R www-data:www-data $FRONTEND_NGINX_HTML
chmod -R 755 $FRONTEND_NGINX_HTML

# ===============================
# 6. إعادة تحميل Nginx
# ===============================
nginx -t && systemctl reload nginx
echo ">> تم إعادة تحميل Nginx بنجاح"

# ===============================
# 7. تشغيل أو إعادة تشغيل Backend
# ===============================
cd $PROJECT_DIR
if pm2 list | grep -q $BACKEND_PM2_NAME; then
    pm2 restart $BACKEND_PM2_NAME
    echo ">> تم إعادة تشغيل Backend"
else
    pm2 start backend/server.js --name $BACKEND_PM2_NAME
    echo ">> تم تشغيل Backend"
fi
pm2 save

# ===============================
# 8. التحقق من شهادة SSL
# ===============================
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo ">> شهادة SSL موجودة وصالحة:"
    certbot certificates | grep -A 2 $DOMAIN
else
    echo ">> لم يتم العثور على شهادة SSL"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ===============================
# 9. Health Check
# ===============================
echo ">> التحقق من صحة الخدمات"
echo "Frontend (HTTPS):"
curl -Ik https://localhost || echo ">> تحذير: Frontend غير متاح!"
echo "Backend API:"
curl -I http://localhost:5000/api/health || echo ">> تحذير: Backend غير متاح!"

# ===============================
# 10. إنهاء ونصائح
# ===============================
echo ">> النشر اكتمل بنجاح"
echo ">> النسخ الاحتياطية محفوظة في: $BACKUP_DIR"
echo ">> لمراجعة لوجات PM2: pm2 logs $BACKEND_PM2_NAME"
