#!/usr/bin/env bash
set -Eeuo pipefail
export TZ=UTC

ROOT="${HOME}/siraj"
LOG_DIR="${ROOT}/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/siraj_brain.out"

log() { echo "[$(date -u +%FT%TZ)] [$1] $2" | tee -a "$LOG_FILE"; }

THRESHOLD_CPU=85
THRESHOLD_MEM=90
PORT=9090

log "BRAIN" "🧠 Siraj Brain online — monitoring backend on port $PORT"

while true; do
  # قراءة استهلاك CPU (متوافق مع Termux)
  CPU=$(top -bn1 | awk '/%Cpu/ {print int($2)}' | head -n1 2>/dev/null || echo 0)
  
  # قراءة استهلاك الذاكرة
MEM=$(free | awk '/Mem:/ {print int(($3/$2)*100)}' 2>/dev/null || echo 0)

  # تأكد أن القيم أرقام صحيحة
  [[ "$CPU" =~ ^[0-9]+$ ]] || CPU=0
  [[ "$MEM" =~ ^[0-9]+$ ]] || MEM=0

  # فحص الحمل
  (( CPU > THRESHOLD_CPU )) && log "WARN" "🔥 High CPU load: ${CPU}%"
  (( MEM > THRESHOLD_MEM )) && log "WARN" "💥 High memory usage: ${MEM}%"

  # فحص حالة السيرفر
  UP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT || echo 000)
  if [[ "$UP" != "200" ]]; then
    log "BRAIN" "🩺 Backend unresponsive (HTTP $UP) — healing..."
    pkill -f "server.js" 2>/dev/null || true
    nohup /data/data/com.termux/files/usr/bin/node "$ROOT/backend/server.js" >> "$LOG_DIR/backend.brain.log" 2>&1 &
    sleep 5
    log "BRAIN" "🔁 Backend restarted"
  fi

  sleep 30
done
