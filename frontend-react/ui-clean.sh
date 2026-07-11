#!/bin/bash

set -e

echo "[1] Fix bg-black"
FILES=$(grep -rl "bg-black" src || true)
if [ ! -z "$FILES" ]; then
  echo "$FILES" | xargs sed -i 's/bg-black/bg-[rgba(0,0,0,0.85)]/g'
fi

echo "[2] Fix text-white in pages only"
FILES=$(grep -rl "text-white" src/pages || true)
if [ ! -z "$FILES" ]; then
  echo "$FILES" | xargs sed -i 's/text-white/text-slate-900/g'
fi

echo "[3] Fix background hard color"
FILES=$(grep -rl "bg-\[#07111F\]" src/pages || true)
if [ ! -z "$FILES" ]; then
  echo "$FILES" | xargs sed -i 's/bg-\[#07111F\]/bg-[var(--bg)]/g'
fi

echo "[4] Fix borders"
FILES=$(grep -rl "border-white/10" src || true)
if [ ! -z "$FILES" ]; then
  echo "$FILES" | xargs sed -i 's/border-white\/10/border-slate-200\/60/g'
fi

echo "[DONE]"
