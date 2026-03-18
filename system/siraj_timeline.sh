#!/usr/bin/env bash
set -euo pipefail
LOG_DIR="$HOME/siraj/logs"
mkdir -p "$LOG_DIR"

if [ $# -gt 0 ]; then
  MSG="$*"
else
  MSG="(no message)"
fi

printf "[%s] %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$MSG" >> "$LOG_DIR/siraj.timeline.log"
