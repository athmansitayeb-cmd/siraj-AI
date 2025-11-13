#!/bin/bash
APP_DIR="$HOME/siraj"
LOG_DIR="$HOME/.ngrok"
URL_FILE="$APP_DIR/url.txt"
NGROK_LOG="$LOG_DIR/ngrok.log"

# تشغيل الخادم
node "$APP_DIR/index.js" &

# إعطاء الخادم وقت للإقلاع
sleep 3

# تشغيل ngrok
ngrok http 3000 --log=stdout > "$NGROK_LOG" &
NGROK_PID=$!

# إعطاء ngrok وقت للإقلاع
sleep 5

# استخراج رابط ngrok وحفظه
URL=$(grep -oE "https://[a-z0-9.-]+\.ngrok(-free)?\.dev|https://[a-z0-9.-]+\.ngrok.io" "$NGROK_LOG" | head -n1)
if [ -n "$URL" ]; then
  echo "$URL" | tee "$URL_FILE"
  date +"[%F %T] رابط ngrok: $URL" >> "$APP_DIR/ngrok_history.log"
fi

wait
