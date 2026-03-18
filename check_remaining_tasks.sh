#!/bin/bash
echo "======================"
echo "تقرير المهام المتبقية لمشروع SIRAJ"
echo "======================"
echo ""

# 1. حالة PM2
echo "1. حالة PM2:"
pm2 list
echo ""

# 2. ملفات أساسية يتوجب وجودها
echo "2. فحص الملفات الأساسية:"
required_files=("backend/core/fusion_api_server.cjs" "frontend-react" "frontend" "auto_start_siraj.sh" "start_pm2.sh")
for f in "${required_files[@]}"; do
    if [ -e ~/siraj/$f ]; then
        echo "[✓] موجود: $f"
    else
        echo "[✗] مفقود: $f"
    fi
done
echo ""

# 3. ملفات config / env
echo "3. فحص ملفات البيئة والاعتماديات:"
if [ -f ~/siraj/.env ]; then
    echo "[✓] ملف .env موجود"
else
    echo "[✗] ملف .env مفقود"
fi
if [ -f ~/siraj/package.json ]; then
    echo "[✓] package.json موجود"
else
    echo "[✗] package.json مفقود"
fi
echo ""

# 4. الاعتماديات Node.js
echo "4. الاعتماديات المثبتة:"
if [ -f ~/siraj/package.json ]; then
    npm list --depth=0
else
    echo "package.json مفقود، لا يمكن عرض الاعتماديات."
fi
echo ""

# 5. حالة PM2 dump و auto resurrect
echo "5. حالة PM2 dump و auto resurrect:"
if [ -f ~/.pm2/dump.pm2 ]; then
    echo "[✓] dump.pm2 موجود"
else
    echo "[✗] dump.pm2 مفقود"
fi
echo ""

# 6. الخدمات الجاهزة للنشر
echo "======================"
echo "تقرير جاهزية النشر:"
# تحقق إذا سيرفر backend يعمل
backend_status=$(pm2 list | grep siraj-backend | grep online)
if [ -n "$backend_status" ]; then
    echo "[✓] سيرفر backend يعمل"
else
    echo "[✗] سيرفر backend غير شغال"
fi

# تحقق إذا frontend موجود
if [ -d ~/siraj/frontend-react ] || [ -d ~/siraj/frontend ]; then
    echo "[✓] واجهة المستخدم موجودة"
else
    echo "[✗] واجهة المستخدم مفقودة"
fi

echo ""
echo "توصيات ما تبقى:"
echo "- أكمل أي ملفات أساسية مفقودة."
echo "- تحقق من ملفات البيئة والاعتماديات."
echo "- تأكد أن جميع العمليات تعمل على PM2."
echo "- اختبر السيرفر محلياً قبل النشر."
echo "- حفظ حالة PM2 dump عبر: pm2 save"
echo "======================"
