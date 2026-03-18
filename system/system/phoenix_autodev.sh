#!/usr/bin/env bash
echo "[🔥 Phoenix] Watching backend..."
BACK=~/siraj/backend/server.js
while true; do
  inotifywait -e modify "$BACK" >/dev/null 2>&1 && {
    echo "[🔥 Phoenix] Change detected, restarting..."
    pkill -f server.js
    nohup node "$BACK" >> ~/siraj/logs/backend.phoenix.log 2>&1 &
  }
  sleep 2
done

# 🔥 Auto-start Siraj Port Guardian
if ! pgrep -f "siraj_fix_port.sh" > /dev/null; then
  nohup bash "$HOME/siraj/system/siraj_fix_port.sh" >> "$HOME/siraj/logs/siraj_fix_port.log" 2>&1 &
  echo "[AUTO] Siraj Port Guardian initialized at $(date -u)" >> "$HOME/siraj/logs/phoenix_autodev.log"
fi

