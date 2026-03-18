#!/usr/bin/env bash
set -euo pipefail
: "${LOG:=$HOME/siraj/logs/siraj_unified.log}"
mkdir -p "$(dirname "$LOG")"
GOLD="\033[38;5;220m"; RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; echo "$msg" >> "$LOG"; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
log "▶ Supervisor starting..."
for f in phoenix_autodev.sh siraj_eternal.sh siraj_guardian.sh siraj_node_watcher.sh siraj_sentinel.sh; do
  if [ -x "$HOME/siraj/system/$f" ]; then
    log "→ launching $f"; nohup bash "$HOME/siraj/system/$f" >> "$LOG" 2>&1 &
  fi
done
while true; do sleep 120; pgrep -f siraj_ >/dev/null || { log "💀 All cores down — rebooting Phoenix..."; exec bash "$0"; }; done
