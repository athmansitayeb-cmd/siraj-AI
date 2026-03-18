#!/usr/bin/env bash
ROOT=$HOME/siraj
LOG_DIR=$ROOT/logs
TL=$ROOT/system/siraj_timeline.sh
while true; do
  BACK=$(pgrep -f server.js)
  WATCH=$(pgrep -f backend_watcher.sh)
  if [ -z "$BACK" ]; then
    bash "$TL" "⚠ backend down — restarting"
    bash "$ROOT/system/run_backend.sh" >> "$LOG_DIR/sentinel.log" 2>&1 &
  fi
  if [ -z "$WATCH" ]; then
    bash "$TL" "⚠ watcher down — reviving"
    bash "$ROOT/system/backend_watcher.sh" >> "$LOG_DIR/sentinel.log" 2>&1 &
  fi
  if [ -n "$BACK" ] && [ -n "$WATCH" ]; then
    bash "$TL" "💚 system stable"
  fi
  sleep 30
done
