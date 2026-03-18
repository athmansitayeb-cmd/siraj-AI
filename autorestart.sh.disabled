#!/bin/bash
URL_FILE="$HOME/siraj/url.txt"
NGROK_LOG="$HOME/.ngrok/ngrok.log"
HISTORY_LOG="$HOME/siraj/siraj_history.log"

echo "[`date +"%F %T"`] 🔹 إيقاف أي عمليات قديمة 🔹" | tee -a "$HISTORY_LOG"
pkill -f "ngrok http 3000" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true

echo "[`date +"%F %T"`] 🔹 تشغيل السيرفر وngrok 🔹" | tee -a "$HISTORY_LOG"
cd "$HOME/siraj"
npm install --silent
node index.js &

sleep 3
ngrok http 3000 --log=stdout > "$NGROK_LOG" &
sleep 5

URL=$(grep -oE "https://[a-z0-9.-]+\.ngrok(-free)?\.dev|https://[a-z0-9.-]+\.ngrok.io" "$NGROK_LOG" | head -n1)
[ -n "$URL" ] && echo "$URL" | tee "$URL_FILE" && echo "[`date +"%F %T"`] رابط ngrok: $URL" | tee -a "$HISTORY_LOG"

echo "[`date +"%F %T"`] 🔹 إعادة تشغيل جميع خدمات PM2 🔹" | tee -a "$HISTORY_LOG"
pm2 restart all || pm2 start all
pm2 save
echo "[`date +"%F %T"`] ✅ كل شيء الآن يعمل" | tee -a "$HISTORY_LOG"
