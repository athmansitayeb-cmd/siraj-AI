#!/bin/bash
# ===========================================================
# سكريبت شامل لنشر مشروع SIRAJ بالكامل
# ===========================================================

set -e  # إنهاء السكريبت عند أي خطأ
PROJECT_DIR="/opt/siraj"
FRONTEND_DIR="$PROJECT_DIR/frontend-react"
FRONTEND_NGINX_HTML="$PROJECT_DIR/frontend/nginx/html"
BACKEND_PM2_NAME="siraj-backend"
DOMAIN="siraj.software"

echo ">> بدء نشر مشروع SIRAJ"

# ===============================
# 1. تحديث Node و NPM (باستخدام NVM)
# ===============================
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo ">> استخدام Node $(node -v) و NPM $(npm -v)"

# ===============================
# 2. بناء Frontend
# ===============================
echo ">> تنظيف وإعادة تثبيت الحزم للـ Frontend"
cd $FRONTEND_DIR
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

echo ">> بناء نسخة Production للـ Frontend"
npm run build

# ===============================
# 3. نشر Frontend إلى Nginx
# ===============================
echo ">> إنشاء مجلد Nginx إذا لم يكن موجود"
mkdir -p $FRONTEND_NGINX_HTML

echo ">> حذف النسخة القديمة ونسخ النسخة الجديدة"
rm -rf $FRONTEND_NGINX_HTML/*
cp -r build/* $FRONTEND_NGINX_HTML/

echo ">> ضبط الصلاحيات"
chown -R www-data:www-data $FRONTEND_NGINX_HTML
chmod -R 755 $FRONTEND_NGINX_HTML

# ===============================
# 4. إعادة تحميل Nginx
# ===============================
echo ">> اختبار إعدادات Nginx وإعادة تحميله"
nginx -t && systemctl reload nginx

# ===============================
# 5. تشغيل أو إعادة تشغيل Backend عبر PM2
# ===============================
echo ">> تشغيل Backend عبر PM2"
cd $PROJECT_DIR
if pm2 list | grep -q $BACKEND_PM2_NAME; then
    pm2 restart $BACKEND_PM2_NAME
else
    pm2 start backend/server.js --name $BACKEND_PM2_NAME
fi
pm2 save

# ===============================
# 6. تحقق من HTTPS (Let's Encrypt)
# ===============================
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo ">> شهادة SSL موجودة وصالحة:"
    certbot certificates | grep -A 2 $DOMAIN
else
    echo ">> لم يتم العثور على شهادة SSL، يمكنك إصدارها باستخدام:"
    echo "sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
fi

# ===============================
# 7. Health Check
# ===============================
echo ">> التحقق من صحة الخدمات:"
echo "Frontend (HTTPS):"
curl -Ik https://localhost || echo ">> تحذير: Frontend غير متاح!"
echo "Backend API:"
curl -I http://localhost:5000/api/health || echo ">> تحذير: Backend غير متاح!"

echo ">> تم النشر بنجاح! جميع الخدمات تعمل."
