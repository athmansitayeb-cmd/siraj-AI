#!/data/data/com.termux/files/usr/bin/env bash
set -euo pipefail
ROOT="$HOME/siraj"; FINAL="$ROOT/final"; LOG="$ROOT/logs/golden_backup.log"; mkdir -p "$FINAL" "$(dirname "$LOG")"
TS=$(date -u +%Y%m%dT%H%M%SZ"); OUT="$FINAL/siraj_final_gem_${TS}.tar.gz"
tar -C "$ROOT" --exclude=./final --exclude=./backups --exclude=**/node_modules -czf "$OUT" . 2>/dev/null || tar -C "$ROOT" -czf "$OUT" README* package*.json src backend frontend 2>/dev/null || true
[ -f "$OUT" ] && sha256sum "$OUT" | awk "{print \$1}" > "${OUT}.sha256"
chmod 444 "$OUT" "${OUT}.sha256" 2>/dev/null || true
printf "[%s] GOLDEN created: %s\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(basename "$OUT")" | tee -a "$LOG"
