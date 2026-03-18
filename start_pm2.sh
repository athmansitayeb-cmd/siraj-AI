k#!/bin/bash
# ~/siraj/start_pm2.sh

# مسار Node و PM2 (تأكد أنه مطابق لنفس مسارك)
export PATH="$HOME/.nvm/versions/node/v20.19.6/bin:$PATH"
export PM2_HOME="$HOME/.pm2"

# تحديث PM2 في الذاكرة إذا كان قديم
pm2 update

# إحياء العمليات المحفوظة
pm2 resurrect

# حفظ الحالة الحالية
pm2 save

# تسجيل رسالة للتأكد من التشغيل
echo "[✓] PM2 processes restored at $(date)" >> $HOME/siraj/pm2_start.log
