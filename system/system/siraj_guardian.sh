#!/usr/bin/env bash
# ======================================
# 💂 Siraj Guardian v2 — Smart Self-Healing Layer
# ======================================

ROOT="$HOME/siraj"
SYS="$ROOT/system"
LOGS="$ROOT/logs"
BACK="$ROOT/backend"
GUARD_LOG="$LOGS/guardian_recovery.log"

mkdir -p "$LOGS" "$BACK"

log(){ printf "[%s] %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" "$*" | tee -a "$GUARD_LOG"; }

log "🛡️ Siraj Guardian initialized"

while true; do
  # 🔹 تأكد أن orchestrator شغال
  if ! pgrep -f "siraj_orchestrator.sh" >/dev/null; then
    log "⚙️ Restarting Orchestrator..."
    nohup bash "$SYS/siraj_orchestrator.sh" start_all >> "$LOGS/siraj_autoboot.log" 2>&1 &
    sleep 8
  fi

  # 🔹 تحقق من السيرفر
  if ! curl -s --max-time 3 http://127.0.0.1:9090 >/dev/null 2>&1; then
    log "🚨 Backend unresponsive — triggering repair system"
    bash "$SYS/siraj_backend_repair.sh" >> "$LOGS/backend.guardian.log" 2>&1
    sleep 5
  else
    log "✅ Backend healthy"
  fi

  # 🔹 حافظ على wake-lock
  if command -v termux-wake-lock >/dev/null 2>&1; then
    termux-wake-lock >/dev/null 2>&1 || true
  fi

  sleep 30
done
