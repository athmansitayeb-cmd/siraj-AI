#!/usr/bin/env bash
LOG_FILE="$HOME/siraj/logs/siraj_fix_port.log"
PORT=8080

echo "[🔥 Siraj Port Guardian] started at $(date -u)" >> "$LOG_FILE"

while true; do
    # تحقق إن المنفذ محجوز أو السيرفر واقف
    PID=$(lsof -t -i:$PORT 2>/dev/null)
    if [ -n "$PID" ]; then
        # المنفذ محجوز لكن ليس من السيرفر الحالي أو السيرفر متوقف
        if ! ps -p "$PID" -o cmd= | grep -q "node.*server.js"; then
            echo "[⚠️ Port $PORT in use by PID $PID — reclaiming...]" >> "$LOG_FILE"
            kill -9 "$PID" 2>/dev/null
            sleep 2
            echo "[💀 Process $PID terminated. Restarting backend...]" >> "$LOG_FILE"
            nohup node "$HOME/siraj/backend/server.js" --port=$PORT >> "$HOME/siraj/logs/backend.restart.log" 2>&1 &
            echo "[✅ Backend restarted cleanly on port $PORT]" >> "$LOG_FILE"
        fi
    else
        # المنفذ حرّ لكن السيرفر غير شغال
        if ! pgrep -f "node.*server.js" >/dev/null; then
            echo "[🚨 Backend down — relaunching now...]" >> "$LOG_FILE"
            nohup node "$HOME/siraj/backend/server.js" --port=$PORT >> "$HOME/siraj/logs/backend.restart.log" 2>&1 &
            echo "[✅ Siraj backend relaunched on port $PORT]" >> "$LOG_FILE"
        fi
    fi
    sleep 5
done
