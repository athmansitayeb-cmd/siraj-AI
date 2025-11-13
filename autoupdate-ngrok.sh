#!/bin/bash
URL_FILE="$HOME/siraj/url.txt"
NGROK_LOG="$HOME/.ngrok/ngrok.log"
while true; do
  URL=$(grep -oE "https://[a-z0-9.-]+\.ngrok(-free)?\.dev|https://[a-z0-9.-]+\.ngrok.io" "$NGROK_LOG" | head -n1)
  if [ -n "$URL" ]; then
    echo "$URL" | tee "$URL_FILE"
  fi
  sleep 60
done
