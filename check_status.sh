#!/bin/bash
echo "======================"
echo "1. عمليات PM2 الحالية"
echo "======================"
pm2 list
echo ""
echo "======================"
echo "2. آخر سجلات siraj-backend"
echo "======================"
pm2 logs siraj-backend --lines 10
echo ""
echo "======================"
echo "3. نسخة Node.js وباكيجات المشروع"
echo "======================"
node -v
npm list --depth=0
echo ""
echo "======================"
echo "4. حالة PM2 dump و auto resurrect"
echo "======================"
pm2 save
cat ~/.pm2/dump.pm2
echo ""
echo "======================"
echo "5. الملفات والمجلدات في مشروع SIRAJ"
echo "======================"
ls -R ~/siraj
echo ""
echo "======================"
echo "انتهى الفحص. يمكنك الآن معرفة ما تبقى للنشر."
echo "======================"
