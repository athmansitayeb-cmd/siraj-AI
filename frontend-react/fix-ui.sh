#!/bin/bash

echo "== SIRAJ UI FIX START =="

# 1. text-white → text-[var(--text)]
grep -rl "text-white" src | xargs sed -i 's/text-white/text-[var(--text)]/g'

# 2. bg-[#07111F] → bg-[var(--bg)]
grep -rl "bg-\[#07111F\]" src | xargs sed -i 's/bg-\[#07111F\]/bg-[var(--bg)]/g'

# 3. bg-black/60 → rgba safer version
grep -rl "bg-black/60" src | xargs sed -i 's/bg-black\/60/bg-[rgba(0,0,0,0.6)]/g'

# 4. border-white → remove or soften
grep -rl "border-white" src | xargs sed -i 's/border-white/border-[var(--border)]/g'

# 5. border-white/10 → design token style
grep -rl "border-white\/10" src | xargs sed -i 's/border-white\/10/border-[var(--border)]/g'

# 6. bg-white/5 cleanup (optional normalization)
grep -rl "bg-white/5" src | xargs sed -i 's/bg-white\/5/bg-white\/5/g'

# 7. cleanup double spaces (safe)
find src -type f -name "*.jsx" -exec sed -i 's/  */ /g' {} +

echo "== DONE: UI unified to design tokens =="
