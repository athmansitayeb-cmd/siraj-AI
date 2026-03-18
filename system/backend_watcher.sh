#!/usr/bin/env bash
set -euo pipefail
termux-wake-lock

ROOT=$HOME/siraj
RUN=$ROOT/system/run_backend.sh
LOG=$ROOT/logs/watcher.log
CHECK_INTERVAL=60

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" | tee -a "$LOG"
}

log "🛰 watcher started"

while true; do
  if ! pgrep -f "server.js" >/dev/null; then
    log "⚠ backend down — restarting..."
    bash "$RUN" >> "$ROOT/logs/backend.watcher.boot.log" 2>&1 &
    sleep 5
    log "✅ backend restarted"
  fi
  sleep "$CHECK_INTERVAL"
done
