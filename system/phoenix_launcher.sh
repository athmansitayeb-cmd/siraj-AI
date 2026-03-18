#!/usr/bin/env bash
ROOT="$HOME/siraj"
SYS="$ROOT/system"
LOG="$ROOT/logs/phoenix_launcher.log"
GIT_REMOTE="$1"
mkdir -p "$ROOT/logs"
# start guardian restore (background)
if ! pgrep -f guardian_restore.sh >/dev/null 2>&1; then
  nohup bash "$SYS/guardian_restore.sh" "${GIT_REMOTE_URL:-}" >> "$LOG" 2>&1 &
fi
# ensure eternal running
if ! pgrep -f siraj_eternal.sh >/dev/null 2>&1; then
  if [ -f "$ROOT/siraj_eternal.sh" ]; then
    nohup bash "$ROOT/siraj_eternal.sh" >> "$ROOT/logs/eternal_autostart.log" 2>&1 &
  fi
fi
echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] Phoenix launcher invoked" >> "$LOG"
