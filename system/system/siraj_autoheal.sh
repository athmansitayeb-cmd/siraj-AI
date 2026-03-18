#!/usr/bin/env bash
set -euo pipefail
ROOT="$HOME/siraj"
BACK="$ROOT/backend"
LOG="$ROOT/logs/siraj_autoheal.log"
NODE="$(command -v node || echo /data/data/com.termux/files/usr/bin/node)"
PORT="${PORT:-8080}"
mkdir -p "$BACK" "$(dirname "$LOG")"

log(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }

log "[autoheal] started"

LOCKFILE="$ROOT/tmp/autoheal.lock"
mkdir -p "$(dirname "$LOCKFILE")"
if ! ( set -o noclobber; echo "$$" > "$LOCKFILE") 2>/dev/null; then
  log "[autoheal] another instance running, exiting"
  exit 0
fi
trap 'rm -f "$LOCKFILE"' EXIT

while true; do
  if ! pgrep -f "node.*/siraj/backend/server.js" >/dev/null; then
    log "[autoheal] node not running, starting..."
    nohup "$NODE" "$BACK/server.js" >> "$ROOT/logs/backend.autoheal.log" 2>&1 &
    sleep 5
  fi

  if lsof -i:"$PORT" >/dev/null 2>&1; then
    log "[autoheal] port $PORT active ✅"
  else
    log "[autoheal] port $PORT down, restarting..."
    pkill -f "node.*/siraj/backend/server.js" || true
    nohup "$NODE" "$BACK/server.js" >> "$ROOT/logs/backend.autoheal.log" 2>&1 &
  fi
  sleep 15
done
