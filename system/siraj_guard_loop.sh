#!/usr/bin/env bash
LOG="$HOME/siraj/logs/guard_$(date +%Y%m%dT%H%M%S).log"
ETERNAL="$HOME/siraj/siraj_eternal.sh"

ensure_eternal() {
  if ! pgrep -f siraj_eternal.sh >/dev/null; then
    echo "[Guardian] Siraj Eternal not running — restarting..." | tee -a "$LOG"
    nohup bash "$ETERNAL" >> "$HOME/siraj/logs/eternal_autostart.log" 2>&1 &
  fi
}

while true; do
  ensure_eternal
  sleep 300  # فحص كل 5 دقائق
done
