#!/bin/bash

# -----------------------------
# SIRAJ Full PM2 Setup & Run
# -----------------------------

# 1. إيقاف أي عمليات PM2 حالية وحذف الإعدادات القديمة
pm2 kill
rm -rf ~/.pm2

# 2. إنشاء هيكل المجلدات إذا لم يكن موجودًا
mkdir -p ~/siraj/{siraj-brain,siraj-backend,siraj-dashboard,siraj-watchdog,siraj-monitor,monitor}

# 3. إنشاء ملفات JS افتراضية (يمكن استبدالها بكودك الحقيقي لاحقًا)
declare -A files=(
  ["siraj-brain"]="index.js"
  ["siraj-backend"]="index.js"
  ["siraj-dashboard"]="server.js"
  ["siraj-watchdog"]="index.js"
  ["siraj-monitor"]="index.js"
  ["monitor"]="guardian.js"
)

for dir in "${!files[@]}"; do
  file="${files[$dir]}"
  echo "console.log(\"$dir running\")" > ~/siraj/$dir/$file
done

# 4. حذف أي عمليات موجودة من قبل (إذا وجدت)
pm2 delete all 2>/dev/null

# 5. تشغيل كل الخدمات مع مراقبة logs منفصلة لكل خدمة
for dir in "${!files[@]}"; do
  file="${files[$dir]}"
  pm2 start ~/siraj/$dir/$file \
    --name "$dir" \
    --watch \
    --restart-delay 2000 \
    --output "~/siraj/$dir/out.log" \
    --error "~/siraj/$dir/error.log"
done

# 6. حفظ حالة PM2 لتعمل عند إعادة التشغيل
pm2 save

# 7. إعداد PM2 للبدء التلقائي عند إعادة تشغيل النظام
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# 8. عرض حالة كل الخدمات
pm2 status
