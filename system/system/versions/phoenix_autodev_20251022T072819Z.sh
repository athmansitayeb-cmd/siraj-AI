#!/data/data/com.termux/files/usr/bin/env bash
set -euo pipefail
# Phoenix AutoDev — self-healing, self-limited to $HOME/siraj

ROOT="${HOME}/siraj"
SYSTEM="$ROOT/system"
LOGS="$ROOT/logs"
VERSIONS="$SYSTEM/versions"
STATE="$SYSTEM/state.json"
TOKEN_FILE="$HOME/.siraj_token"
GIT_DIR="$ROOT"
CHECK_INTERVAL=${CHECK_INTERVAL:-60}        # seconds between checks
SELF_REWRITE_INTERVAL=${SELF_REWRITE_INTERVAL:-21600}  # 6 hours
KEEP_BACKUPS=${KEEP_BACKUPS:-5}

mkdir -p "$SYSTEM" "$LOGS" "$VERSIONS" "$ROOT/final" "$ROOT/backups" "$ROOT/tmp"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOGS/phoenix_autodev.log"; }

# bind to user: create secret token file if missing (owner only)
if [ ! -f "$TOKEN_FILE" ]; then
  head -c 32 /dev/urandom | base64 | tr -d '/+=' > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  log "🔐 Token created at $TOKEN_FILE (keeps Phoenix bound to this account)."
fi

# read token to memory (binding enforcement)
SIRAJ_TOKEN="$(cat "$TOKEN_FILE" 2>/dev/null || echo "")"
if [ -z "$SIRAJ_TOKEN" ]; then
  log "❌ Token missing or unreadable; aborting."
  exit 1
fi

# helper: ensure a background process exists for a given name and start command
ensure_proc(){
  local name="$1"; shift
  local cmd="$*"
  # only allow processes that live under $ROOT
  if pgrep -f "$name" >/dev/null 2>&1; then
    return 0
  fi
  log "🛠️  Starting $name..."
  nohup bash -c "cd \"$ROOT\" && $cmd" >> "$LOGS/phoenix_proc_${name}.log" 2>&1 &
  sleep 1
  if pgrep -f "$name" >/dev/null 2>&1; then
    log "✅ $name started."
  else
    log "⚠️ Failed to start $name."
  fi
}

# safe self-update from git if remote exists and repo present
self_update(){
  if [ -d "$GIT_DIR/.git" ]; then
    log "⟳ Checking git updates..."
    ( cd "$GIT_DIR" && git fetch --all --quiet ) 2>/dev/null || return 1
    LOCAL="$(git -C "$GIT_DIR" rev-parse @ 2>/dev/null || true)"
    REMOTE="$(git -C "$GIT_DIR" rev-parse @{u} 2>/dev/null || true)"
    if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
      log "⬇️ Updates found — pulling..."
      ( cd "$GIT_DIR" && git pull --ff-only --quiet ) 2>/dev/null && log "✅ Pulled updates." || log "⚠️ Git pull failed."
    fi
  fi
}

# analyze logs to extract top 3 recurring error keywords
analyze_logs(){
  local out="$SYSTEM/top_errors.txt"
  grep -iE "error|fail|exception|traceback|segfault" -h "$LOGS"/*.log 2>/dev/null | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9 ]/ /g' | tr ' ' '\n' | grep -E 'error|fail|exception|timeout|denied|refused|segfault' | sort | uniq -c | sort -rn | head -n 10 > "$out" || true
  log "🔎 Log analysis saved to $out"
}

# create a safe version (snapshot) of this script (self-rewrite backup)
self_snapshot(){
  local ts; ts="$(date -u +%Y%m%dT%H%M%SZ)"
  local ver="$VERSIONS/phoenix_autodev_${ts}.sh"
  cp -f "$SYSTEM/phoenix_autodev.sh" "$ver" 2>/dev/null || true
  chmod 700 "$ver" || true
  log "🧾 Snapshot saved: $(basename "$ver")"
  # prune old snapshots
  ls -1t "$VERSIONS"/phoenix_autodev_*.sh 2>/dev/null | tail -n +"$((KEEP_BACKUPS+1))" | xargs -r rm -f || true
}

# repair basic structure if missing
repair_structure(){
  for d in "$ROOT" "$SYSTEM" "$LOGS" "$ROOT/backups" "$ROOT/final" "$ROOT/tmp"; do
    [ -d "$d" ] || { mkdir -p "$d"; log "🛡️ Recreated missing dir: $d"; }
  done
}

# rotate final/backups, keep last N
prune_backups(){
  ls -1t "$ROOT/backups"/*.tar.gz 2>/dev/null | tail -n +"$((KEEP_BACKUPS+1))" | xargs -r rm -f || true
  ls -1t "$ROOT/final"/*.tar.gz 2>/dev/null | tail -n +"$((KEEP_BACKUPS+1))" | xargs -r rm -f || true
}

# safe tar creation (light if full fails)
make_final_snapshot(){
  local ts; ts="$(date -u +%Y%m%dT%H%M%SZ)"
  local out="$ROOT/final/siraj_final_gem_${ts}.tar.gz"
  log "📦 Building final snapshot..."
  if tar -C "$ROOT" --exclude='final' --exclude='backups' --exclude='node_modules' -czf "$out" . 2>/dev/null; then
    log "✅ Snapshot created: $(basename "$out")"
  else
    log "⚠️ Full tar failed — creating light snapshot..."
    tar -C "$ROOT" --exclude='final' --exclude='backups' --exclude='node_modules' -czf "$out" README_AUTOMATION.txt archives keys logs src package*.json 2>/dev/null || { log "❌ Light snapshot failed"; return 1; }
    log "✅ Light snapshot created: $(basename "$out")"
  fi
  sha256sum "$out" | awk '{print $1}' > "${out}.sha256" || true
  chmod 444 "$out" "${out}.sha256" || true
}

# main loop variables
last_rewrite=0
last_update=0
last_snapshot=0

log "🔰 Phoenix AutoDev started and bound to token at $TOKEN_FILE"

# quick initial repair and ensure critical procs
repair_structure
ensure_proc "siraj_autonomous_v2.sh" "bash \"$ROOT/siraj_autonomous_v2.sh\" || true"
ensure_proc "siraj_eternal.sh" "bash \"$ROOT/siraj/siraj_eternal.sh\" || true"
ensure_proc "siraj_guardian" "bash \"$ROOT/system/siraj_guard_loop.sh\" || true"  # if exists

# loop — lightweight checks every CHECK_INTERVAL seconds
while true; do
  # binding check (prevent accidental runs under different HOME)
  if [ ! -f "$TOKEN_FILE" ] || [ "$(cat "$TOKEN_FILE" 2>/dev/null || echo '')" != "$SIRAJ_TOKEN" ]; then
    log "⚠️ Token mismatch or removed — exiting to avoid cross-account actions."
    exit 2
  fi

  # 1) repair basic structure
  repair_structure

  # 2) ensure essential processes (only allowed commands inside $ROOT)
  ensure_proc "siraj_autonomous_v2.sh" "bash \"$ROOT/siraj_autonomous_v2.sh\" || true"
  ensure_proc "siraj_eternal.sh" "bash \"$ROOT/siraj/siraj_eternal.sh\" || true"
  # ensure node app if index.js present
  if [ -f "$ROOT/index.js" ]; then
    if ! pgrep -f "node .*index.js" >/dev/null 2>&1; then
      log "🟦 Starting node index.js..."
      nohup node "$ROOT/index.js" >> "$LOGS/node_runtime.log" 2>&1 &
    fi
  fi

  # 3) periodic maintenance: logs analysis, prune, snapshot
  now=$(date +%s)
  if (( now - last_update > 3600 )); then
    self_update
    analyze_logs
    last_update=$now
  fi

  if (( now - last_snapshot > 14400 )); then  # every 4 hours
    make_final_snapshot
    prune_backups
    last_snapshot=$now
  fi

  # 4) self-rewrite snapshot (store a copy) every SELF_REWRITE_INTERVAL
  if (( now - last_rewrite > SELF_REWRITE_INTERVAL )); then
    self_snapshot
    last_rewrite=$now
  fi

  # 5) watch logs for repeated crashes and attempt smart restart
  # find most recent error lines
  if grep -iE "segfault|fatal|panic|unhandled|exception|error" "$LOGS"/*.log 2>/dev/null | head -n 1 >/dev/null; then
    top_errs=$(grep -iE "segfault|fatal|panic|unhandled|exception|error" "$LOGS"/*.log 2>/dev/null | awk '{print $0}' | tail -n 50)
    echo "$top_errs" > "$SYSTEM/recent_errors.txt"
    log "🧠 Recent_errors saved, attempting soft-restarts..."
    # soft restart node processes
    pkill -f "node .*index.js" || true
    sleep 1
    if [ -f "$ROOT/index.js" ]; then
      nohup node "$ROOT/index.js" >> "$LOGS/node_runtime.log" 2>&1 &
      log "🔁 Node restarted."
    fi
  fi

  # 6) rotate phoenix's own log to keep small footprint
  ls -1t "$LOGS"/phoenix_autodev*.log 2>/dev/null | tail -n +6 | xargs -r rm -f || true

  sleep "$CHECK_INTERVAL"
done
