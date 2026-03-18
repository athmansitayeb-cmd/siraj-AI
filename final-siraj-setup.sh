#!/bin/bash

set -e

BASE_DIR="$HOME/siraj"
cd "$BASE_DIR"

pm2 delete all || true
pm2 flush || true

declare -A apps
apps=(
  ["siraj-backend"]="siraj-backend/app.js"
  ["siraj-dashboard"]="siraj-dashboard/app.js"
  ["siraj-brain"]="siraj-brain/app.js"
  ["siraj-monitor"]="siraj-monitor/app.js"
  ["siraj-watchdog"]="siraj-watchdog/app.js"
  ["siraj-all"]="siraj-all/app.js"
)

missing=0
for app in "${!apps[@]}"; do
  script="${apps[$app]}"
  if [ ! -f "$script" ]; then
    echo "Missing file: $script"
    missing=1
  fi
done

if [ $missing -eq 1 ]; then
  echo "Fix missing files first."
  exit 1
fi

cat > "$BASE_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    { name: "siraj-backend", script: "./siraj-backend/app.js", watch: true, autorestart: true },
    { name: "siraj-dashboard", script: "./siraj-dashboard/app.js", watch: true, autorestart: true },
    { name: "siraj-brain", script: "./siraj-brain/app.js", watch: true, autorestart: true },
    { name: "siraj-monitor", script: "./siraj-monitor/app.js", watch: true, autorestart: true },
    { name: "siraj-watchdog", script: "./siraj-watchdog/app.js", watch: true, autorestart: true },
    { name: "siraj-all", script: "./siraj-all/app.js", watch: true, autorestart: true }
  ]
};
EOF

pm2 start "$BASE_DIR/ecosystem.config.js"
pm2 save

sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

pm2 save

echo "Siraj services fully rebuilt and started."
pm2 list
