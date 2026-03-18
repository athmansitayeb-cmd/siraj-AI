#!/usr/bin/env bash
set -euo pipefail
ROOT="$HOME/siraj"
SYS="$ROOT/system"
LOGDIR="$ROOT/logs"
FINAL="$ROOT/final"
STATE="$SYS/ai_state.db"
INTERVAL=${AI_INTERVAL:-60}
MONFILES=("$LOGDIR"/*.log)
ERRKEYS="error|failed|exception|traceback|segfault|panic|timeout|refused|denied"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ printf '[%s] %s\n' "$(ts)" "$*" | tee -a "$LOGDIR/ai_hybrid.log"; }

mkdir -p "$SYS" "$LOGDIR" "$FINAL"
: > "$STATE" 2>/dev/null || true

log "🤖 AI-Hybrid starting — interval=${INTERVAL}s"

# bootstrap history file
if [ ! -f "$STATE" ]; then
  echo "TS=$(ts)" > "$STATE"
  echo "HISTORY=0" >> "$STATE"
  echo "AVG=0" >> "$STATE"
fi

# helper to compute error count in last window (seconds)
count_recent_errors(){
  local since_seconds="$1"
  local sum=0
  # check each log file safely
  for f in $LOGDIR/*.log; do
    [ -f "$f" ] || continue
    # count lines with error keywords in last N seconds using awk by timestamp if available, else last 200 lines
    # fallback: use tail
    cnt=$(tail -n 500 "$f" 2>/dev/null | grep -E -i "$ERRKEYS" | wc -l)
    sum=$((sum + cnt))
  done
  echo "$sum"
}

# action: graceful remediation
remediate(){
  log "🛠️ AI-Hybrid remediation triggered: $*"
  # snapshot before changes
  TS=$(date -u +%Y%m%dT%H%M%SZ)
  SNAP="$FINAL/ai_snapshot_${TS}.tar.gz"
  tar -C "$ROOT" --exclude='./final' --exclude='./backups' --exclude='**/node_modules' -czf "$SNAP" system logs 2>/dev/null || tar -C "$ROOT" -czf "$SNAP" system 2>/dev/null || true
  log "📦 Snapshot created: $(basename "$SNAP")"
  # restart node backend (best-effort)
  if pgrep -f "node .*index.js" >/dev/null 2>&1 || [ -f "$ROOT/index.js" ]; then
    pkill -f "node .*index.js" >/dev/null 2>&1 || true
    nohup node "$ROOT/index.js" >> "$LOGDIR/backend_ai.log" 2>&1 &
    log "🔁 node index.js restarted"
  elif [ -f "$ROOT/backend/server.js" ]; then
    pkill -f "node .*server.js" >/dev/null 2>&1 || true
    nohup node "$ROOT/backend/server.js" >> "$LOGDIR/backend_ai.log" 2>&1 &
    log "🔁 backend/server.js restarted"
  else
    log "⚠️ No known backend entrypoint to restart"
  fi
  # attempt to restart guardian/phoenix if present
  for s in siraj_guardian.sh phoenix_autodev.sh siraj_eternal.sh; do
    if [ -f "$SYS/$s" ]; then
      pkill -f "$s" >/dev/null 2>&1 || true
      nohup bash "$SYS/$s" >> "$LOGDIR/${s%.sh}.ai.log" 2>&1 &
      log "🔁 relaunched $s"
    fi
  done
  # optional: attempt lightweight npm install if package.json changed (non-interactive)
  if [ -f "$ROOT/package.json" ]; then
    (cd "$ROOT" && if command -v pnpm >/dev/null 2>&1; then pnpm install --silent || true; elif command -v npm >/dev/null 2>&1; then npm ci --silent || npm install --silent || true; fi) &
    log "📦 background deps check started"
  fi
  # notify (termux-notification if available)
  if command -v termux-notification >/dev/null 2>&1; then
    termux-notification --title "Siraj AI" --content "Remediation performed at $(ts)" || true
  fi
}

# main loop: monitor, compute moving-average, act if spike sustained
while true; do
  ERRCOUNT=$(count_recent_errors 60)
  # read state
  . "$STATE" 2>/dev/null || true
  HISTORY=${HISTORY:-0}
  AVG=${AVG:-0}
  # update moving average (exponential smoothing)
  alpha=0.25
  # compute new average approx: AVG = alpha*ERRCOUNT + (1-alpha)*AVG
  NEWAVG=$(awk -v a="$alpha" -v e="$ERRCOUNT" -v g="$AVG" 'BEGIN{printf("%.2f", a*e + (1-a)*g)}')
  # store history (small ring)
  HISTORY=$((HISTORY + 1))
  echo "TS=$(ts)" > "$STATE"
  echo "HISTORY=$HISTORY" >> "$STATE"
  echo "AVG=$NEWAVG" >> "$STATE"
  log "🔎 err=$ERRCOUNT avg=$NEWAVG"
  # decision: if ERRCOUNT >= max(5, 2*AVG) and sustained for 2 consecutive checks -> remediate
  THRESH=$(awk -v g="$NEWAVG" 'BEGIN{t= g*2; if(t<5) t=5; printf("%d", t)}')
  # maintain counter file for consecutive spikes
  CNTFILE="$SYS/ai_spike_counter"
  cnt=0
  [ -f "$CNTFILE" ] && cnt=$(cat "$CNTFILE" 2>/dev/null || echo 0)
  if [ "$ERRCOUNT" -ge "$THRESH" ]; then
    cnt=$((cnt + 1))
    echo "$cnt" > "$CNTFILE"
    log "⚠️ spike detected ($cnt/$((2))) threshold=$THRESH"
  else
    cnt=0
    echo "$cnt" > "$CNTFILE"
  fi
  if [ "$cnt" -ge 2 ]; then
    remediate "error spike:$ERRCOUNT threshold:$THRESH"
    echo 0 > "$CNTFILE"
  fi
  # daily housekeeping: rotate final snapshots to keep last 7
  find "$FINAL" -maxdepth 1 -type f -name "ai_snapshot_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
  # sleep
  sleep "$INTERVAL"
done
