#!/usr/bin/env bash
set -euo pipefail

# ===============================
# SIRAJ Full Deployment Script
# ===============================

PROJECT_DIR="/opt/siraj"
API_PORT=3000
DASHBOARD_PORT=9091
DOMAIN="siraj.software"

echo ">> تحديث النظام وتثبيت المتطلبات"
apt update -y
apt install -y curl docker.io docker-compose nodejs nginx certbot python3-certbot-nginx git

# ===============================
# 1) إنشاء مجلد المشروع إذا لم يكن موجوداً
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# ===============================
# 2) إنشاء docker-compose.yml متكامل
cat > docker-compose.yml <<EOF
version: "3.8"
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - siraj_net

  siraj-api:
    build: ./api
    restart: unless-stopped
    env_file:
      - ./.env
    ports:
      - "${API_PORT}:${API_PORT}"
    depends_on:
      - mongo
    networks:
      - siraj_net

  dashboard:
    build: ./dashboard
    restart: unless-stopped
    env_file:
      - ./.env
    ports:
      - "${DASHBOARD_PORT}:${DASHBOARD_PORT}"
    networks:
      - siraj_net

volumes:
  mongo_data:

networks:
  siraj_net:
EOF

# ===============================
# 3) إعداد ملفات .env
cat > .env <<EOF
NODE_ENV=production
PORT=${API_PORT}
MONGO_URI=mongodb://mongo:27017/siraj
JWT_SECRET=$(openssl rand -hex 16)
NGROK_AUTHTOKEN=
EOF

# ===============================
# 4) إنشاء مجلدات API و Dashboard (Skeleton)
mkdir -p api dashboard

# API index.js
cat > api/index.js <<'EOF'
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraj';

const contextSchema = new mongoose.Schema({ sessionId: String, timestamp: { type: Date, default: Date.now }, text: String, meta: Object });
const knowledgeSchema = new mongoose.Schema({ title: String, content: String, sources: [String], embeddings: Object, createdAt: { type: Date, default: Date.now }});
const inferenceSchema = new mongoose.Schema({ inputRef: mongoose.Schema.Types.ObjectId, result: Object, metrics: Object, createdAt: { type: Date, default: Date.now }});

const Context = mongoose.model('Context', contextSchema);
const Knowledge = mongoose.model('Knowledge', knowledgeSchema);
const Inference = mongoose.model('Inference', inferenceSchema);

mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

app.get('/health', (req,res)=>res.json({status:'ok',ts:new Date()}));

app.post('/km/knowledge', async (req,res)=>{ const k = new Knowledge(req.body); await k.save(); res.status(201).json(k); });
app.get('/km/knowledge', async (req,res)=>{ const items = await Knowledge.find().limit(50).lean(); res.json({count:items.length,items}); });
app.post('/km/infer', async (req,res)=>{ const {input} = req.body; const ctx = new Context({sessionId:req.body.sessionId||'anon',text:input,meta:{}}); await ctx.save(); const inf = new Inference({inputRef:ctx._id,result:{reply:'رد تجريبي من SIRAJ'},metrics:{latency_ms:12}}); await inf.save(); res.json({inference:inf}); });
app.get('/monitor/metrics', async (req,res)=>{ res.json({ uptime:process.uptime(), memory:process.memoryUsage(), loadavg:require('os').loadavg() }); });

app.listen(PORT, ()=>console.log(`SIRAJ API running on :${PORT}`));
EOF

# API package.json
cat > api/package.json <<'EOF'
{
  "name": "siraj-api",
  "version": "1.0.0",
  "main": "index.js",
  "engines": { "node": ">=18" },
  "dependencies": {
    "express": "^4.22.1",
    "mongoose": "^7.3.0",
    "body-parser": "^1.20.2",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  }
}
EOF

# Dashboard placeholder
cat > dashboard/server.js <<'EOF'
const express = require('express');
const app = express();
const PORT = process.env.PORT || 9091;
app.get('/', (req,res)=>res.send('SIRAJ Dashboard running'));
app.listen(PORT,()=>console.log(`Dashboard on :${PORT}`));
EOF

cat > dashboard/package.json <<'EOF'
{
  "name": "siraj-dashboard",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": { "express": "^4.22.1", "dotenv": "^16.3.1" }
}
EOF

# ===============================
# 5) Nginx Reverse Proxy & SSL
echo ">> إعداد Nginx و SSL ل$DOMAIN"
cat > /etc/nginx/sites-available/siraj <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    location / {
        proxy_pass http://127.0.0.1:${DASHBOARD_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:${API_PORT}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/siraj /etc/nginx/sites-enabled/siraj
nginx -t
systemctl restart nginx

# Certbot SSL
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN

# ===============================
# 6) تشغيل Docker Compose
echo ">> بناء وتشغيل Docker Compose"
docker-compose up --build -d

# ===============================
# 7) تثبيت تبعيات Node محلياً
echo ">> تثبيت تبعيات Node داخل api و dashboard"
cd api && npm ci --silent && cd ../dashboard && npm ci --silent && cd ..

# ===============================
# 8) نهائي
echo ">> انتهى النشر الكامل لـ SIRAJ"
echo "API: http://localhost:${API_PORT} أو https://${DOMAIN}/api/"
echo "Dashboard: http://localhost:${DASHBOARD_PORT} أو https://${DOMAIN}/"
echo "Logs: docker-compose logs -f"
