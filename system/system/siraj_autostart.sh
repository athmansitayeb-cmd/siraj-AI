#!/usr/bin/env bash
# ============================================
# 🌅 SIRAJ AUTOSTART CORE — total resurrection
# ============================================

ROOT="$HOME/siraj"
SYS="$ROOT/system"
LOGS="$ROOT/logs"
mkdir -p "$LOGS"

echo "[AutoStart] 🔁 Initializing Siraj Resurrection at $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$LOGS/autostart.log"

# Array of all core modules
modules=(
  "siraj_phoenix.sh"
  "siraj_guardian.sh"
  "siraj_eternal.sh"
  "siraj_supervisor.sh"
  "siraj_sentinel.sh"
  "siraj_restore.sh"
)

for mod in "${modules[@]}"; do
  if pgrep -f "$mod" >/dev/null 2>&1; then
    echo "[AutoStart] ✅ $mod already running" >> "$LOGS/autostart.log"
  else
    if [ -f "$SYS/$mod" ]; then
      echo "[AutoStart] ▶ Launching $mod..." >> "$LOGS/autostart.log"
      nohup bash "$SYS/$mod" >> "$LOGS/${mod%.sh}.autostart.log" 2>&1 &
      sleep 1
    else
      echo "[AutoStart] ⚠️ Missing: $mod" >> "$LOGS/autostart.log"
    fi
  fi
done

echo "[AutoStart] 🧠 All modules checked — system restored and active." >> "$LOGS/autostart.log"
