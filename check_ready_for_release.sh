#!/bin/bash
echo "======================"
echo "تقرير حالة مشروع SIRAJ"
echo "======================"
echo ""

# 1. حالة عمليات PM2
echo "1. حالة PM2:"
pm2 list
echo ""

# 2. حالة السيرفر
echo "2. آخر سجلات siraj-backend:"
pm2 logs siraj-backend --lines 10
echo ""

# 3. نسخ Node.js والاعتماديات
echo "3. نسخة Node.js وباكيجات المشروع:"
node -v
npm list --depth=0
echo ""

# 4. فحص ملفات المشروع
echo "4. فحص الملفات الأساسية:"
required_files=("backend/core/fusion_api_server.cjs" "frontend-react" "auto_start_siraj.sh" "start_pm2.sh")
for f in "${required_files[@]}"; do
    if [ -e ~/siraj/$f ]; then
        echo "[✓] موجود: $f"
    else
        echo "[✗] مفقود: $f"
    fi
done
echo ""

# 5. حالة PM2 dump و auto resurrect
echo "5. فحص dump و auto resurrect:"
if [ -f ~/.pm2/dump.pm2 ]; then
    echo "[✓] dump.pm2 موجود"
else
    echo "[✗] dump.pm2 مفقود"
fi
echo ""

# 6. توصيات للنشر
echo "======================"
echo "توصيات قبل النشر:"
echo "- تأكد من أن جميع العمليات تعمل عبر PM2."
echo "- تأكد أن كل ملفات المشروع الأساسية موجودة."
echo "- تحقق من الاعتماديات في package.json."
echo "- قم باختبار السيرفر محلياً على http://localhost:7070"
echo "- بعد التأكد، احفظ PM2 dump عبر: pm2 save"
echo "======================"
