# الصق السكربت ثم احفظ#!/bin/bash
# ===========================================
# One-shot installer: PM2 Guardian Smart + Watcher
# ===========================================

set -e

USER_HOME="/home/athman"
BIN_DIR="/usr/local/bin"
LOG_FILE="$USER_HOME/.pm2/guardian-smart.log"

echo "✅ Step 1: Creating PM2 Guardian Smart script..."
cat > $BIN_DIR/pm2-guardian-smart.sh << 'EOF'
#!/bin/bash
LOG_FILE="$HOME/.pm2/guardian-smart.log"
echo "$(date '+%Y-%m-%d %H:%M:%S') | Guardian auto-check entry" >> "$LOG_FILE"

# Start PM2 apps
pm2 start $HOME/siraj_backup/siraj/siraj-backend.js --name siraj-backend --watch --no-autorestart >/dev/null 2>&1
pm2 start $HOME/siraj_backup/siraj/siraj-brain.js --name siraj-brain --watch >/dev/null 2>&1
pm2 start $HOME/siraj_backup/siraj/siraj-watchdog.js --name siraj-watchdog --watch >/dev/null 2>&1

# Start Watcher if not running
if ! pgrep -af pm2-guardian-watch.sh > /dev/null; then
    $BIN_DIR/pm2-guardian-watch.sh &
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Guardian started Watcher" >> "$LOG_FILE"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') | Guardian check complete" >> "$LOG_FILE"
EOF

chmod +x $BIN_DIR/pm2-guardian-smart.sh

echo "✅ Step 2: Creating PM2 Guardian Watcher script..."
cat > $BIN_DIR/pm2-guardian-watch.sh << 'EOF'
#!/bin/bash
LOG_FILE="$HOME/.pm2/guardian-smart.log"

while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S') | Watcher heartbeat" >> "$LOG_FILE"
    for app in siraj-backend siraj-brain siraj-watchdog; do
        if ! pm2 list | grep -q "$app"; then
            pm2 restart "$app" >/dev/null 2>&1
            echo "$(date '+%Y-%m-%d %H:%M:%S') | Watcher restarted $app" >> "$LOG_FILE"
        fi
    done
    sleep 30
done
EOF

chmod +x $BIN_DIR/pm2-guardian-watch.sh

echo "✅ Step 3: Creating systemd service..."
cat > /etc/systemd/system/pm2-guardian.service << EOF
[Unit]
Description=PM2 Guardian Smart Service
After=network.target

[Service]
Type=simple
User=athman
ExecStart=$BIN_DIR/pm2-guardian-smart.sh
Restart=always
RestartSec=10
Environment=HOME=$USER_HOME

[Install]
WantedBy=multi-user.target
EOF

echo "✅ Step 4: Reloading systemd and starting service..."
sudo systemctl daemon-reload
sudo systemctl enable pm2-guardian
sudo systemctl start pm2-guardian

echo "✅ Installation complete!"
echo "Check status with: sudo systemctl status pm2-guardian --no-pager"
echo "Logs: tail -f $LOG_FILE"
