#!/bin/bash
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
MAGENTA='\033[1;35m'
CYAN='\033[1;36m'
RESET='\033[0m'

while true; do
  clear
  echo -e "${MAGENTA}🟣 لوحة SIRAJ الذكية - حيّة 🟣${RESET}"
  echo ""

  # رابط ngrok
  echo -e "${CYAN}🔗 رابط ngrok الحالي:${RESET}"
  if [ -f ~/siraj/url.txt ] && grep -q "https://" ~/siraj/url.txt; then
    echo -e "${GREEN}$(cat ~/siraj/url.txt)${RESET}"
  else
    echo -e "${RED}❌ رابط ngrok غير موجود أو لم يتم تشغيله بعد${RESET}"
  fi
  echo ""

  # حالة خدمات PM2
  echo -e "${BLUE}🖥️ حالة PM2 والخدمات:${RESET}"
  pm2 list --no-color | awk '
    BEGIN{print ""}
    /online/{printf "\033[1;32m%s\033[0m\n",$0}
    /errored|stopped/{printf "\033[1;31m%s\033[0m\n",$0}
    !/online|errored|stopped/{print $0}
  '
  echo ""

  # استهلاك CPU/Memory أعلى 10 عمليات
  echo -e "${RED}💻 استهلاك CPU/Memory أعلى 10 عمليات:${RESET}"
  ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -n 10
  echo ""

  # سجل ngrok وعمليات SIRAJ (آخر 15 سطر)
  echo -e "${YELLOW}📜 سجل ngrok وعمليات SIRAJ (آخر 15 سطر):${RESET}"
  if [ -f ~/.ngrok/ngrok.log ]; then
    tail -n 15 ~/.ngrok/ngrok.log
  else
    echo -e "${RED}❌ لا يوجد سجل ngrok حتى الآن${RESET}"
  fi
  echo ""

  # تنبيه ذكي إذا أي خدمة توقفت
  PM2_ERRORS=$(pm2 list --no-color | grep -E "errored|stopped")
  if [ -n "$PM2_ERRORS" ]; then
    echo -e "${RED}⚠️ تنبيه: بعض الخدمات توقفت! تحقق من PM2.${RESET}"
  fi

  # تحديث كل 3 ثوانٍ
  sleep 3
done
