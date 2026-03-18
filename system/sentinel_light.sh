#!/usr/bin/env bash
ROOT=$HOME/siraj
LOG=$ROOT/logs/siraj.timeline.log
WATCHER=$ROOT/system/backend_watcher.sh
while true; do
  if pgrep -f backend_watcher.sh >/dev/null && pgrep -f run_backend.sh >/dev/null && pgrep -f server.js >/dev/null; then
    printf "[%s] 💠 Sentinel: all systems stable\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"
  else
    printf "[%s] ⚠ Sentinel: issue detected → attempting fix\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"
    bash "$WATCHER" >> "$ROOT/logs/backend.watcher.boot.log" 2>&1 &
  fi
  sleep 300
done
