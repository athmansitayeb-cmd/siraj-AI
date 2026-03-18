#!/bin/bash

# تشغيل ngrok إذا لم يكن يعمل مسبقًا
if ! pgrep -x "ngrok" > /dev/null; then
  /home/athman/siraj/ngrok http 3000 > /home/athman/.ngrok/ngrok.log 2>&1 &
  sleep 5  # انتظر ngrok ليبدأ
fi

# استخراج رابط ngrok
URL=$(grep -oE "https://[a-z0-9.-]+\\.ngrok(-free)?\\.dev|https://[a-z0-9.-]+\\.ngrok.io" "/home/athman/.ngrok/ngrok.log" | tail -n1)

if [ -n "$URL" ]; then
  echo "$URL" | tee "/home/athman/siraj/url.txt"
  date +"[%F %T] ngrok link: $URL" >> "/home/athman/siraj/ngrok_history.log"
fi
