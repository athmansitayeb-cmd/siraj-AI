#!/usr/bin/env bash
set -euo pipefail
ROOT=$HOME/siraj
LOGDIR=$ROOT/logs
LOG=$LOGDIR/backend.service.log
NODE=$(command -v node)
SERVER=$ROOT/backend/server.js
PORT=9090
LOCK=$ROOT/tmp/backend.lock
mkdir -p "$LOGDIR" "$(dirname "$LOCK")"
exec 9>"$LOCK"; flock -n 9 || { echo "[$(date -u +%FT%TZ)] ⚠ another instance running, exit" >> "$LOG"; exit 0; }
echo "[$(date -u +%FT%TZ)] 🚀 Siraj backend guardian online (PORT=$PORT)" >> "$LOG"
pkill -f "server.js" || true
nohup "$NODE" "$SERVER" >> "$LOG" 2>&1 &
echo $! > "$ROOT/tmp/backend.lock.pid"
sleep 2
curl -s --max-time 2 "http://127.0.0.1:$PORT" >/dev/null && echo "[$(date -u +%FT%TZ)] ✅ backend revived on port $PORT" >> "$LOG"
