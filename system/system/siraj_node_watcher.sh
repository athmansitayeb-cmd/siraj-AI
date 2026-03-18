#!/usr/bin/env bash
set -euo pipefail
ROOT="$HOME/siraj"
LOGS="$ROOT/logs"
NL="$LOGS/node_watcher.log"
mkdir -p "$LOGS"
log(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$NL"; }
log "🔭 node_watcher active"
while true; do
  if ! pgrep -f "node .*index.js|node .*backend" >/dev/null 2>&1; then
    log "🔁 node not running — starting"
    [ -f "$ROOT/index.js" ] && nohup node "$ROOT/index.js" >> "$LOGS/backend.out.log" 2>&1 & log "✅ started index.js"
    [ -f "$ROOT/backend/server.js" ] && nohup node "$ROOT/backend/server.js" >> "$LOGS/backend.out.log" 2>&1 & log "✅ started backend/server.js"
  fi
  sleep 20
done
