#!/usr/bin/env bash
set -euo pipefail
: "${LOG:=$HOME/siraj/logs/siraj_unified.log}"
mkdir -p "$(dirname "$LOG")"
GOLD="\033[38;5;220m"; RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; echo "$msg" >> "$LOG"; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
while true; do
  log "🔆 Golden Sentinel active — watching backups."
  find "$HOME/siraj/final" -type f -mtime -1 -exec cp {} "$HOME/siraj/backups/" \; 2>/dev/null
  sleep 14400
done
