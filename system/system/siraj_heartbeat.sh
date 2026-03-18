#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/siraj"
LOG="$ROOT/logs/heartbeat.log"
mkdir -p "$(dirname "$LOG")"

check_proc() {
  pgrep -f "$1" >/dev/null 2>&1 && echo "up" || echo "down"
}

check_http_port() {
  local host=127.0.0.1
  for p in 8080 9090 3000 8000; do
    if curl -s --max-time 2 -I "http://${host}:${p}" >/dev/null 2>&1; then
      echo "up(${p})"
      return 0
    fi
  done
  echo "down"
  return 1
}

while true; do
  CPU_LOAD=$(top -bn1 | awk '/%Cpu/{print 100 - $8"%"}' | head -n1)
  MEM_FREE=$(free -m | awk '/Mem/{print $4"MB"}')
  SRV_STATUS=$(check_proc "server.js")
  WEB_STATUS=$(check_http_port)
  echo "$(date '+%Y-%m-%d %H:%M:%S') | CPU:${CPU_LOAD} MEM:${MEM_FREE} SRV:${SRV_STATUS} WEB:${WEB_STATUS}" >> "$LOG"
  sleep 10
done
