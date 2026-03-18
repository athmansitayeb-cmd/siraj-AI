#!/usr/bin/env bash
# ⚡ SIRAJ GOLDEN RESTORE CORE ⚡
# By Si Tayeb — last bastion of integrity

LOG="$HOME/siraj/logs/siraj_restore.log"
SRC="$HOME/siraj/final"
SYS="$HOME/siraj/system"
BACK="$HOME/siraj/backend"

echo "[GoldenRestore] initialized at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$LOG"

inotifywait -m -r -e delete,modify,move "$SYS" "$BACK" | while read path action file; do
    echo "[Alert] $file was $action at $(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> "$LOG"

    # Check in final backup
    if [ -f "$SRC/$file" ]; then
        cp -f "$SRC/$file" "$path/$file"
        echo "[Restore] $file restored from golden source." >> "$LOG"
    else
        echo "[Warning] $file missing from golden source!" >> "$LOG"
    fi

    # Relaunch affected service if needed
    case "$file" in
        *.sh)
            bash "$SYS/siraj_guardian.sh" &
            echo "[Action] Guardian relaunched after $file event." >> "$LOG"
            ;;
        *.js)
            pkill -f server.js
            nohup node "$BACK/server.js" >> "$HOME/siraj/logs/server.log" 2>&1 &
            echo "[Action] Backend relaunched after $file event." >> "$LOG"
            ;;
    esac
done
