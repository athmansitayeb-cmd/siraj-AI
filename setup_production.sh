#!/bin/bash
set -e

echo "== SIRAJ PRODUCTION HARDENING =="

# ---- ENV VARS ----
pm2 set siraj-backend:NODE_ENV production
pm2 set siraj-backend:JWT_ACCESS_EXPIRES 15m
pm2 set siraj-backend:JWT_REFRESH_EXPIRES 30d
pm2 set siraj-backend:JWT_ISSUER siraj.software
pm2 set siraj-backend:JWT_AUDIENCE siraj-users
pm2 set siraj-backend:DISABLE_REGISTER true
pm2 set siraj-backend:RATE_LIMIT_LOGIN 5
pm2 set siraj-backend:RATE_LIMIT_REFRESH 10

# ---- DEPENDENCIES ----
cd /opt/siraj/backend
npm install express-rate-limit jsonwebtoken bcrypt --silent

# ---- PM2 CLEAN RESTART ----
pm2 restart siraj-backend --update-env

echo "== DONE. BACKEND HARDENED =="
pm2 show siraj-backend | grep -E "status|uptime|restarts"
