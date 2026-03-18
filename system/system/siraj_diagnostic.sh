#!/usr/bin/env bash
set -euo pipefail
ROOT="${HOME}/siraj"
LOG="${ROOT}/logs/diagnostic.report"
mkdir -p "${ROOT}/logs"
log(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }

log "🔎 DIAGNOSTIC started"
# ensure core scripts running
for proc in siraj_brain.sh siraj_genesis.sh siraj_learning.sh siraj_guardian.sh siraj_supervisor.sh siraj_eternal.sh siraj_sentinel.sh; do
  if pgrep -f "$proc" >/dev/null 2>&1; then
    log "✅ $proc active"
  else
    log "⚠️ $proc missing — launching"
    [ -x "${HOME}/siraj/system/$proc" ] && nohup bash "${HOME}/siraj/system/$proc" >> "${HOME}/siraj/logs/${proc%.sh}.restart.log" 2>&1 &
  fi
done

# check important ports and heal backend
for port in 8080 9090; do
  if command -v lsof >/dev/null 2>&1 && lsof -i:"$port" | grep -q LISTEN; then
    log "✅ port $port LISTEN"
  else
    log "❌ port $port DOWN — attempting to start backend"
    if [ -f "${HOME}/siraj/backend/server.js" ]; then
      nohup node "${HOME}/siraj/backend/server.js" >> "${HOME}/siraj/logs/backend.diagnostic.log" 2>&1 &
      sleep 1
      if command -v curl >/dev/null 2>&1 && curl -s --max-time 2 "http://localhost:$port" >/dev/null; then
        log "✅ backend responding on port $port"
      else
        log "⚠️ backend not responding yet on $port"
      fi
    else
      log "⚠️ no backend entrypoint at ${HOME}/siraj/backend/server.js"
    fi
  fi
done

# basic resource snapshot
if command -v top >/dev/null 2>&1; then
  CPU=$(top -b -n 1 | head -3 | tail -1 2>/dev/null || echo "")
else
  CPU=""
fi
MEM=$(free -m 2>/dev/null | awk '/Mem:/ {print $3 "/" $2 "MB"}' || echo "n/a")
log "ℹ️ CPU: ${CPU}; MEM: ${MEM}"
log "🔚 DIAGNOSTIC completed"
