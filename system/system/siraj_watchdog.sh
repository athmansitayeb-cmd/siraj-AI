#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${HOME}/siraj"
SYS="${ROOT}/system"
LOG="${ROOT}/logs/siraj_watchdog.log"
echo "[🧠 WATCHDOG] Siraj total supervisor active at $(date -u +%FT%TZ)" | tee -a "$LOG"

while true; do
  for svc in siraj_genesis.sh siraj_brain.sh backend/server.js; do
    if ! pgrep -f "$svc" >/dev/null 2>&1; then
      echo "[⚠️ WATCHDOG] $svc down — restarting..." | tee -a "$LOG"
      case "$svc" in
        siraj_genesis.sh)
          nohup bash "$SYS/siraj_genesis.sh" >> "$LOG" 2>&1 &
          ;;
        siraj_brain.sh)
          nohup bash "$SYS/siraj_brain.sh" >> "$LOG" 2>&1 &
          ;;
        backend/server.js)
          nohup /data/data/com.termux/files/usr/bin/node "$ROOT/backend/server.js" >> "$LOG" 2>&1 &
          ;;
      esac
      echo "[✅ WATCHDOG] $svc restarted at $(date -u +%FT%TZ)" | tee -a "$LOG"
    fi
  done
  sleep 20
done
