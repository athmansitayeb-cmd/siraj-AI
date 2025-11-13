#!/bin/bash
while true; do
  clear
  echo -e "\033[1;32m🔗 رابط ngrok الحالي:\033[0m"
  cat "/home/athman/siraj/url.txt"
  echo -e "\n\033[1;34m📊 PM2 لوحة المونيتور:\033[0m"
  pm2 ls
  sleep 5
done
