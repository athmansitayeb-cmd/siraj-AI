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
BACKUPS="$ROOT/backups"
VERSIONS="$ROOT/versions"
LOGS="$ROOT/logs"
mkdir -p "$BACKUPS" "$VERSIONS" "$LOGS"

echo "[AUTOUPDATE] $(date -u +%FT%TZ) checking for updates..." | tee -a "$LOGS/phoenix_autoupdate.out.log"

LATEST="$VERSIONS/latest"
if [ -d "$LATEST" ]; then
  echo "[AUTOUPDATE] found update directory. creating backup..." | tee -a "$LOGS/phoenix_autoupdate.out.log"
  BKP="$BACKUPS/update_$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$BKP"
  cp -r "$ROOT/system" "$ROOT/backend" "$ROOT/siraj_autonomous_v2.sh" "$BKP/" 2>/dev/null || true
  cp -r "$LATEST"/* "$ROOT/" 2>/dev/null || true
  echo "[AUTOUPDATE] update applied successfully." | tee -a "$LOGS/phoenix_autoupdate.out.log"
else
  echo "[AUTOUPDATE] no updates found." | tee -a "$LOGS/phoenix_autoupdate.out.log"
fi
