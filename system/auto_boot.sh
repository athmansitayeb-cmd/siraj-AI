#!/usr/bin/env bash
ROOT=$HOME/siraj
LOG=$ROOT/logs/auto_boot.log
WATCHER=$ROOT/system/backend_watcher.sh
if ! pgrep -f backend_watcher.sh >/dev/null; then
  printf "[%s] 🌀 auto-boot: starting watcher\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"
  bash "$WATCHER" >> "$ROOT/logs/backend.watcher.boot.log" 2>&1 &
else
  printf "[%s] 🌀 auto-boot: watcher already running\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$LOG"
fi
