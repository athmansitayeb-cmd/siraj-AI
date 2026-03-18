#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
LOG="$HOME/siraj/logs/siraj_autonomous_v2.log"
PIDFILE="$HOME/siraj/tmp/siraj_autonomous_v2.lock"

mkdir -p "$(dirname "$LOG")" "$(dirname "$PIDFILE")"

echo "[Siraj Autonomous v2] Started at $(date)" | tee -a "$LOG"

if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE")
  if ps -p "$OLD_PID" >/dev/null 2>&1; then
    echo "[!] Already running with PID $OLD_PID — exiting." | tee -a "$LOG"
    exit 0
  fi
fi

echo $$ > "$PIDFILE"

# --- المهام الرئيسية ---
while true; do
  echo "[Cycle] $(date): Siraj Autonomous heartbeat." | tee -a "$LOG"
  sleep 1800  # كل نصف ساعة نبض عمل
done
