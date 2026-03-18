#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
BASE="$HOME/siraj"
LOGDIR="$BASE/logs"
mkdir -p "$LOGDIR" "$BASE/final"
LOG="$LOGDIR/eternal_main.log"
echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Eternal] started" | tee -a "$LOG"

# minimal reliable guardian + backup loop
ensure_server() {
  # try to start the project's node server if exists
  if [ -f "$BASE/index.js" ] || [ -d "$BASE/backend" ]; then
    if ! pgrep -f "node .*index.js|node .*backend/server.js" >/dev/null 2>&1; then
      echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Eternal] launching node backend" | tee -a "$LOG"
      nohup bash -lc "cd '$BASE' && (node index.js 2>&1 | tee -a '$LOG' &)" >> "$LOG" 2>&1 &
    fi
  fi
}

backup_snapshot() {
  TS=\$(date -u +%Y%m%dT%H%M%SZ)
  OUT="$BASE/final/siraj_full_\${TS}.tar.gz"
  echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Eternal] creating snapshot \$OUT" | tee -a "$LOG"
  # create tar without including final dir; be safe with options order
  (cd "$HOME" && tar --warning=no-file-changed -czf "\$OUT" "siraj" --exclude="siraj/final" --exclude="siraj/final/*" ) >> "$LOG" 2>&1 || echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Eternal] tar failed" | tee -a "$LOG"
  sha256sum "\$OUT" 2>>"$LOG" | awk '{print \$1}' > "\$OUT.sha256" 2>>"$LOG" || true
  chmod 444 "\$OUT" "\$OUT.sha256" 2>/dev/null || true
}

# safe loop: every cycle ensure server alive; daily backup; rotate old files
CYCLE_SECS=300      # check every 5 minutes
BACKUP_SECS=86400   # backup interval 24h
LAST_BAK=0
while true; do
  ensure_server
  NOW=\$(date +%s)
  if (( NOW - LAST_BAK >= BACKUP_SECS )); then
    backup_snapshot
    LAST_BAK=\$NOW
  fi
  # rotate backups: keep last 10
  cd "$BASE/final" 2>/dev/null || true
  ls -1t siraj_full_*.tar.gz 2>/dev/null | tail -n +11 | xargs -r rm -f 2>/dev/null || true
  sleep \$CYCLE_SECS
done
