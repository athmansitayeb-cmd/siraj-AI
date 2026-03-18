#!/bin/bash
LOG=~/.pm2/guardian-smart.log
echo "$(date '+%Y-%m-%d %H:%M:%S') | Guardian active" >> $LOG
pm2 resurrect || pm2 start ~/siraj_backup/siraj/ecosystem.config.js
