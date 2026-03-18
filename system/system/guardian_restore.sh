#!/usr/bin/env bash
set -euo pipefail
: "${LOG:=$HOME/siraj/logs/siraj_unified.log}"
mkdir -p "$(dirname "$LOG")"
GOLD="\033[38;5;220m"
RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; printf "%s\n" "$msg" >> "$LOG" 2>/dev/null; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
# PHOENIX_GOLD_PATCH
GOLD="\033[38;5;220m"
RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; printf "%s\n" "$msg" >> "$LOG" 2>/dev/null; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
ROOT="$HOME/siraj"
LOG="$ROOT/logs/guardian_restore.log"
GIT_REMOTE="$1"
mkdir -p "$ROOT/logs"
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }

embedded_restore() {
  log "🔧 Restoring embedded eternal script..."
  cat > "$ROOT/siraj_eternal.sh" <<'E'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
: "${LOG:=$HOME/siraj/logs/siraj_unified.log}"
mkdir -p "$(dirname "$LOG")"
GOLD="\033[38;5;220m"
RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; printf "%s\n" "$msg" >> "$LOG" 2>/dev/null; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
# PHOENIX_GOLD_PATCH
GOLD="\033[38;5;220m"
RESET="\033[0m"
ts(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
log(){ local msg="[$(ts)] $*"; printf "${GOLD}%s${RESET}\n" "$msg"; printf "%s\n" "$msg" >> "$LOG" 2>/dev/null; }
log "⚡ PHOENIX GOLDEN CORE ⚡ initialized..."
echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] Restored minimal eternal" >> "$HOME/siraj/logs/eternal_restored.log"
sleep 2
E
  chmod +x "$ROOT/siraj_eternal.sh"
}

attempt_git_restore() {
  if [ -n "${GIT_REMOTE_URL:-}" ]; then
    log "🌐 Attempting git fetch/checkout from $GIT_REMOTE ..."
    if command -v git >/dev/null 2>&1; then
      if [ -d "$ROOT/.git" ]; then
        git -C "$ROOT" fetch --all --prune >> "$LOG" 2>&1 || true
        git -C "$ROOT" reset --hard origin/$(git -C "$ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo main) >> "$LOG" 2>&1 || true
      else
        rm -rf "$ROOT/.siraj_restore_tmp" 2>/dev/null || true
        git clone --depth 1 "${GIT_REMOTE_URL:-}" "$ROOT/.siraj_restore_tmp" >> "$LOG" 2>&1 && cp -a "$ROOT/.siraj_restore_tmp/"* "$ROOT/" && rm -rf "$ROOT/.siraj_restore_tmp"
      fi
      # if script now exists, done
      [ -f "$ROOT/siraj_eternal.sh" ] && chmod +x "$ROOT/siraj_eternal.sh" && return 0
    fi
  fi
  return 1
}

while true; do
  if ! pgrep -f siraj_eternal.sh >/dev/null 2>&1; then
    log "⚠️ Eternal missing or not running — trying to restart/restore..."
    if [ -f "$ROOT/siraj_eternal.sh" ]; then
      nohup bash "$ROOT/siraj_eternal.sh" >> "$ROOT/logs/eternal_autorestore.log" 2>&1 &
      log "✅ Eternal restarted from file."
    else
      if attempt_git_restore "${GIT_REMOTE_URL:-}"; then
        log "✅ Restored from git."
        nohup bash "$ROOT/siraj_eternal.sh" >> "$ROOT/logs/eternal_autorestore.log" 2>&1 &
      else
        embedded_restore
        nohup bash "$ROOT/siraj_eternal.sh" >> "$ROOT/logs/eternal_autorestore.log" 2>&1 &
        log "✅ Restored embedded fallback."
      fi
    fi
  fi
  sleep 60
done
