#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="${HOME}/siraj"
LOG="${ROOT}/logs/siraj_genesis.out"
PORT=9090

echo "[🚀 GENESIS] Initializing at $(date -u +%FT%TZ)" | tee -a "$LOG"

# === Launch backend if not running ===
if ! pgrep -f "server.js" >/dev/null 2>&1; then
  nohup /data/data/com.termux/files/usr/bin/node "$ROOT/backend/server.js" >> "$ROOT/logs/backend.genesis.log" 2>&1 &
  sleep 3
  echo "[✅ GENESIS] Backend started on port $PORT" | tee -a "$LOG"
else
  echo "[ℹ️ GENESIS] Backend already running" | tee -a "$LOG"
fi

# === Auto-link Brain ===
if ! pgrep -f "siraj_brain.sh" >/dev/null 2>&1; then
  echo "[🧠 LINK] Brain not detected — starting..." | tee -a "$LOG"
  nohup bash "$ROOT/system/siraj_brain.sh" >> "$ROOT/logs/siraj_brain.link.log" 2>&1 &
  sleep 2
  echo "[✅ LINK] Brain linked successfully" | tee -a "$LOG"
else
  echo "[🧩 LINK] Brain already active" | tee -a "$LOG"
fi

echo "[🌐 GENESIS] Dashboard online at http://127.0.0.1:$PORT" | tee -a "$LOG"
