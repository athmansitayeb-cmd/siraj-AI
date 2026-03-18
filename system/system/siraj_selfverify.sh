#!/usr/bin/env bash
set -euo pipefail
LOG="$HOME/siraj/logs/siraj_selfverify.log"
URL="http://localhost:8080"
FAILS=0
log(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }
while true; do
  if curl -fs --max-time 3 "$URL" > /dev/null; then
    FAILS=0
    log "[selfverify] OK"
  else
    ((FAILS++))
    log "[selfverify] FAIL $FAILS"
    if ((FAILS>=3)); then
      log "[selfverify] restarting full Siraj stack..."
      pkill -f server.js || true
      bash ~/siraj/system/siraj_eternal.sh &
      FAILS=0
    fi
  fi
  sleep 60
done
