#!/usr/bin/env bash
set -euo pipefail
HOME=${HOME:-/data/data/com.termux/files/home}
ROOT="$HOME/siraj"
HASH_FILE="$ROOT/fortress.token.hash"
if [ ! -f "$HASH_FILE" ]; then
  echo "⚠ No fortress token found. Aborting."
  exit 1
fi
if [ "${1-}" != "" ]; then
  INPUT="$1"
else
  read -s -p "Enter Siraj Fortress token: " INPUT; echo
fi
INPUT_HASH=$(printf "%s" "$INPUT" | sha256sum | awk "{print \$1}")
STORED_HASH=$(cat "$HASH_FILE" 2>/dev/null || echo "")
[ -z "$STORED_HASH" ] && { echo "⚠ Stored hash missing. Abort."; exit 2; }
[ "$INPUT_HASH" != "$STORED_HASH" ] && { echo "Token invalid. Abort."; exit 3; }
echo "✅ Token verified. Disabling Siraj now..."
pkill -f "run_backend.sh" 2>/dev/null || true
pkill -f "backend_watcher.sh" 2>/dev/null || true
pkill -f "server.js" 2>/dev/null || true
rm -f "$HASH_FILE" 2>/dev/null || true
printf "[%s] Fortress unlocked.\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
