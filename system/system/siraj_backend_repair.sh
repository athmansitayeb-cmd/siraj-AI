#!/usr/bin/env bash
set -euo pipefail
ROOT="${HOME}/siraj"
LOG="${ROOT}/logs/backend.repair.log"
NODE="$(command -v node || echo /data/data/com.termux/files/usr/bin/node)"
SERVER="${ROOT}/backend/server.js"
PORT="${SIRAJ_BACKEND_PORT:-9090}"

log(){ printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG"; }

log "🧠 Backend Repair System engaged"

mkdir -p "$(dirname "$SERVER")"

if [ ! -s "$SERVER" ]; then
  log "⚠️  server.js missing or empty — creating fallback server on port $PORT"
  cat > "$SERVER" <<JS
import http from "http";
const PORT = process.env.PORT || $PORT;
const server = http.createServer((req,res)=>{
  res.writeHead(200,{"Content-Type":"text/plain"});
  res.end("🚀 Siraj Backend (auto-repaired)\\n");
});
server.listen(PORT,()=>console.log(\`Siraj backend restored and running on port \${PORT}\`));
JS
  chmod +x "$SERVER" || true
  log "✅ server.js created."
fi

if ! pgrep -f "$SERVER" >/dev/null 2>&1; then
  log "🚀 Starting backend with: $NODE $SERVER"
  nohup "$NODE" "$SERVER" >> "${ROOT}/logs/backend.restart.log" 2>&1 &
  sleep 2
fi

if curl -s --max-time 3 "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
  log "✅ Backend responsive on port $PORT"
  exit 0
fi

log "❌ Backend not responsive — retrying restart"
pkill -f "$SERVER" || true
sleep 1
nohup "$NODE" "$SERVER" >> "${ROOT}/logs/backend.repair.retry.log" 2>&1 &
sleep 2

if curl -s --max-time 3 "http://127.0.0.1:$PORT" >/dev/null 2>&1; then
  log "🔥 Auto-repair succeeded — backend live on port $PORT"
else
  log "💀 Auto-repair failed — manual intervention required"
fi
