#!/bin/bash
cd ~/siraj || exit

# حذف أي عمليات قائمة مسبقًا
pm2 delete all

# مسح أي ملف ecosystem قديم
rm -f ~/siraj/ecosystem.config.js

# إنشاء ملف ecosystem جديد ديناميكيًا
echo "module.exports = { apps: [" > ~/siraj/ecosystem.config.js

for dir in */; do
  if [ -f "$dir"*.js ]; then
    file=$(ls "$dir"*.js | head -n 1)
    name=$(basename "$dir")
    echo "  { name: \"$name\", script: \"$file\", watch: true, autorestart: true, max_memory_restart: '200M', env: { NODE_ENV: 'production' } }," >> ~/siraj/ecosystem.config.js
  fi
done

echo "]};" >> ~/siraj/ecosystem.config.js

# تشغيل كل الخدمات الجديدة
pm2 start ~/siraj/ecosystem.config.js

# حفظ قائمة العمليات
pm2 save

# تفعيل تشغيل PM2 عند الإقلاع
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u athman --hp /home/athman

# حفظ مرة أخرى للتأكيد
pm2 save

# عرض القائمة
pm2 list
