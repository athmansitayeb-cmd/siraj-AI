#!/bin/bash
URL=$(grep -oE "https://[a-z0-9.-]+\\.ngrok(-free)?\\.dev|https://[a-z0-9.-]+\\.ngrok.io" "/home/athman/.ngrok/ngrok.log" | head -n1)
if [ -n "$URL" ]; then
  echo "$URL" | tee "/home/athman/siraj/url.txt"
  date +"[%F %T] ngrok link: $URL" >> "/home/athman/siraj/ngrok_history.log"
fi
