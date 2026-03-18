#!/bin/bash
echo "======================"
echo "تقرير اختبار SIRAJ للمستخدم النهائي"
echo "======================"

# 1. حالة PM2
echo -e "\n1. حالة PM2:"
pm2 list

# 2. آخر السجلات
echo -e "\n2. آخر سجلات siraj-backend (آخر 10 أسطر):"
tail -n 10 ~/.pm2/logs/siraj-backend-out.log

# 3. فحص الملفات الأساسية
echo -e "\n3. فحص الملفات الأساسية:"
FILES=("backend/core/fusion_api_server.cjs" "frontend-react" "frontend" "auto_start_siraj.sh" "start_pm2.sh")
for f in "${FILES[@]}"; do
    if [ -e "$HOME/siraj/$f" ]; then
        echo "[✓] موجود: $f"
    else
        echo "[✗] مفقود: $f"
    fi
done

# 4. التحقق من ملفات البيئة و package.json
echo -e "\n4. فحص ملفات البيئة والاعتماديات:"
[ -e "$HOME/siraj/.env" ] && echo "[✓] ملف .env موجود" || echo "[✗] ملف .env مفقود"
[ -e "$HOME/siraj/package.json" ] && echo "[✓] package.json موجود" || echo "[✗] package.json مفقود"

# 5. اختبار الوصول للواجهة على localhost
echo -e "\n5. اختبار الوصول للواجهة:"
if curl -s --head http://localhost:7070 | grep "200 OK" > /dev/null; then
    echo "[✓] الواجهة تعمل على http://localhost:7070"
else
    echo "[✗] لا يمكن الوصول للواجهة على http://localhost:7070"
fi

# 6. الاعتماديات المثبتة
echo -e "\n6. الاعتماديات المثبتة:"
cd $HOME/siraj
npm list --depth=0

# 7. تقرير جاهزية النشر
echo -e "\n======================"
echo "تقرير جاهزية النشر:"
if pm2 list | grep siraj-backend | grep online > /dev/null; then
    echo "[✓] سيرفر backend يعمل"
else
    echo "[✗] سيرفر backend غير فعال"
fi

if [ -d "$HOME/siraj/frontend" ] && [ -d "$HOME/siraj/frontend-react" ]; then
    echo "[✓] واجهة المستخدم موجودة"
else
    echo "[✗] واجهة المستخدم مفقودة"
fi

echo -e "\nتوصيات:"
echo "- تأكد من جميع الملفات الأساسية موجودة."
echo "- تحقق من ملفات البيئة واعتماديات المشروع."
echo "- اختبر كل المزايا على localhost قبل النشر."
echo "- احفظ حالة PM2 dump عبر: pm2 save"
echo "======================"
