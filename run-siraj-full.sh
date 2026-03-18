#!/bin/bash
LOG_DIR="/home/athman/siraj/logs"
mkdir -p "$LOG_DIR"

# تشغيل Ngrok في الخلفية مع تسجيل كامل
/home/athman/siraj/start-ngrok.sh >> "$LOG_DIR/ngrok.log" 2>&1 &

# تشغيل SIRAJ مع تسجيل كامل
/home/athman/siraj/run-siraj.sh >> "$LOG_DIR/siraj.log" 2>&1
