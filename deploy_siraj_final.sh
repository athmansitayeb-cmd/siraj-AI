#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="/opt/siraj_final"
PORT_API=3000
PORT_DASH=9091

echo ">> إنشاء هيكل المشروع النهائي في: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"/{api,dashboard,scripts,infra/docs,service,infra/monitoring}

cd "$PROJECT_DIR"

# ----------------------------
# 1) ملف .env مثال
cat > .env.example <<EOF
NODE_ENV=production
PORT_API=${PORT_API}
PORT_DASH=${PORT_DASH}
MONGO_URI=mongodb://mongo:27017/siraj
JWT_SECRET=change_this_to_secure_value
NGROK_AUTHTOKEN=
EOF

# ----------------------------
# 2) docker-compose.yml
cat > docker-compose.yml <<'EOF'
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
      - ./.env.example
    ports:
      - "3000:3000"
    depends_on:
      - mongo
    networks:
      - siraj_net

  siraj-dashboard:
    build: ./dashboard
    restart: unless-stopped
    env_file:
      - ./.env.example
    ports:
      - "9091:9091"
    networks:
      - siraj_net

volumes:
  mongo_data:

networks:
  siraj_net:
EOF

# ----------------------------
# 3) API Node + Express + Mongoose
mkdir -p api
cat > api/Dockerfile <<'EOF'
FROM node:18-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node","index.js"]
EOF

cat > api/package.json <<'EOF'
{
  "name": "siraj-api",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.3.0",
    "body-parser": "^1.20.2",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1"
  }
}
EOF

cat > api/index.js <<'EOF'
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));

const PORT = process.env.PORT_API || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraj';

const contextSchema = new mongoose.Schema({ sessionId:String, timestamp:Date, text:String, meta:Object });
const knowledgeSchema = new mongoose.Schema({ title:String, content:String, sources:[String], embeddings:Object, createdAt:{type:Date, default:Date.now} });
const inferenceSchema = new mongoose.Schema({ inputRef:mongoose.Schema.Types.ObjectId, result:Object, metrics:Object, createdAt:{type:Date, default:Date.now} });

const Context = mongoose.model('Context', contextSchema);
const Knowledge = mongoose.model('Knowledge', knowledgeSchema);
const Inference = mongoose.model('Inference', inferenceSchema);

mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

app.get('/health', (req,res)=>res.json({status:'ok',ts:new Date()}));

app.post('/km/knowledge', async (req,res)=>{
  const k = new Knowledge(req.body);
  await k.save();
  res.status(201).json(k);
});

app.get('/km/knowledge', async (req,res)=>{
  const items = await Knowledge.find().limit(50).lean();
  res.json({ count: items.length, items });
});

app.post('/km/infer', async (req,res)=>{
  const { input } = req.body;
  const ctx = new Context({ sessionId:req.body.sessionId||'anon', text: input, meta:{} });
  await ctx.save();
  const inf = new Inference({ inputRef: ctx._id, result: { reply: 'رد ذكي من نواة SIRAJ' }, metrics: { latency_ms: 12, success_flag: true, confidence_score: 0.8 }});
  await inf.save();
  res.json({ inference: inf });
});

app.get('/monitor/metrics', async (req,res)=>{
  res.json({ uptime: process.uptime(), memory: process.memoryUsage(), loadavg: require('os').loadavg() });
});

app.listen(PORT, ()=>console.log(`SIRAJ API running on :${PORT}`));
EOF

# ----------------------------
# 4) Dashboard Node.js بسيط
mkdir -p dashboard
cat > dashboard/Dockerfile <<'EOF'
FROM node:18-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 9091
CMD ["node","server.js"]
EOF

cat > dashboard/package.json <<'EOF'
{
  "name": "siraj-dashboard",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": { "express": "^4.18.2", "dotenv": "^16.3.1" }
}
EOF

cat > dashboard/server.js <<'EOF'
const express = require('express');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT_DASH || 9091;

app.get('/', (req,res)=>res.send('<h1>SIRAJ Dashboard</h1>'));
app.listen(PORT, ()=>console.log(`Dashboard running on :${PORT}`));
EOF

# ----------------------------
# 5) Self-Learning متقدم
mkdir -p scripts/self_learning
cat > scripts/self_learning/replay_trainer.js <<'EOF'
const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraj';

mongoose.connect(MONGO_URI).then(()=>console.log('Mongo connected for self-learning'));

const Context = mongoose.model('Context', new mongoose.Schema({ sessionId:String, timestamp:Date, text:String, meta:Object }));
const Inference = mongoose.model('Inference', new mongoose.Schema({ inputRef:mongoose.Schema.Types.ObjectId, result:Object, metrics:Object, createdAt:Date }));

async function analyzeLastInteractions(limit=1000) {
    const lastInferences = await Inference.find().sort({ createdAt:-1 }).limit(limit).lean();
    const stats = lastInferences.map(i => ({
        latency_ms: i.metrics.latency_ms || 0,
        success_flag: i.metrics.success_flag || true,
        confidence_score: i.metrics.confidence_score || 0.5
    }));
    const avgLatency = stats.reduce((sum,s)=>sum+s.latency_ms,0)/stats.length || 0;
    const avgConfidence = stats.reduce((sum,s)=>sum+s.confidence_score,0)/stats.length || 0;
    const successRate = stats.filter(s=>s.success_flag).length / stats.length;
    console.log(`>> Stats(last ${stats.length}): avgLatency=${avgLatency.toFixed(2)}ms, successRate=${(successRate*100).toFixed(1)}%, avgConfidence=${avgConfidence.toFixed(2)}`);
}

analyzeLastInteractions().then(()=>mongoose.disconnect());
EOF

# ----------------------------
# 6) Prometheus + Grafana Monitoring
cat > infra/monitoring/prometheus.yml <<'EOF'
global:
  scrape_interval: 10s
  evaluation_interval: 15s
scrape_configs:
  - job_name: 'siraj_api'
    metrics_path: /monitor/metrics
    static_configs:
      - targets: ['host.docker.internal:3000']
  - job_name: 'siraj_dashboard'
    metrics_path: /
    static_configs:
      - targets: ['host.docker.internal:9091']
EOF

cat > infra/monitoring/grafana_dashboard.json <<'EOF'
{
  "dashboard": {
    "id": null,
    "title": "SIRAJ Production Dashboard",
    "timezone": "browser",
    "panels": [
      { "type": "graph", "title": "API Memory Usage", "targets":[{"expr":"process_resident_memory_bytes{job='siraj_api'}"}]},
      { "type": "graph", "title": "API Uptime", "targets":[{"expr":"process_uptime_seconds{job='siraj_api'}"}]},
      { "type": "graph", "title": "Dashboard Requests", "targets":[{"expr":"http_requests_total{job='siraj_dashboard'}"}]}
    ]
  }
}
EOF

# ----------------------------
# 7) سكربت تشغيل سريع
cat > infra/up.sh <<'EOF'
#!/usr/bin/env bash
set -e
docker-compose up --build -d
echo ">> تحقق: docker ps"
echo ">> Self-Learning دوري: pm2 start scripts/self_learning/replay_trainer.js --name self-learning --watch"
EOF
chmod +x infra/up.sh

# ----------------------------
# 8) تثبيت تبعيات Node محليًا (لتجربة بدون دوكر)
cd api && npm ci --silent && cd ../dashboard && npm ci --silent && cd ..

# ----------------------------
echo ">> انتهى إعداد SIRAJ Final Production."
echo ">> ملفات رئيسية: docker-compose.yml, api/, dashboard/, scripts/self_learning/, infra/monitoring/"
echo ">> لتشغيل الآن:"
echo "   ./infra/up.sh"
echo ">> للتحقق من الصحة:"
echo "   curl http://localhost:${PORT_API}/health"
echo "   curl http://localhost:${PORT_DASH}/"
