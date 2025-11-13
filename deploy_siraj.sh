#!/usr/bin/env bash
set -euo pipefail

# اسم المشروع ومجلد العمل
PROJECT_DIR="${PWD}/siraj_phase1"
PORT=3000

echo ">> إنشاء هيكل المشروع في: $PROJECT_DIR"
mkdir -p "$PROJECT_DIR"/{api,infra,service,docs}
cd "$PROJECT_DIR"

# 1) .env مثال
cat > .env.example <<EOF
# SIRAJ Phase1 environment example
NODE_ENV=production
PORT=${PORT}
MONGO_URI=mongodb://mongo:27017/siraj
JWT_SECRET=change_this_to_secure_value
NGROK_AUTHTOKEN=
EOF

# 2) docker-compose.yml بسيط بمونجو وخادم Node
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

volumes:
  mongo_data:

networks:
  siraj_net:
EOF

# 3) API: Node + Express + Mongoose skeleton مع مسارات Knowledge Manager و health و monitor
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
  "engines": { "node": ">=18" },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.3.0",
    "body-parser": "^1.20.2",
    "morgan": "^1.10.0"
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

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraj';

// --- Schemas: context, knowledge, inference ---
const contextSchema = new mongoose.Schema({
  sessionId: String,
  timestamp: { type: Date, default: Date.now },
  text: String,
  meta: Object
});
const knowledgeSchema = new mongoose.Schema({
  title: String,
  content: String,
  sources: [String],
  embeddings: Object,
  createdAt: { type: Date, default: Date.now }
});
const inferenceSchema = new mongoose.Schema({
  inputRef: mongoose.Schema.Types.ObjectId,
  result: Object,
  metrics: Object,
  createdAt: { type: Date, default: Date.now }
});

const Context = mongoose.model('Context', contextSchema);
const Knowledge = mongoose.model('Knowledge', knowledgeSchema);
const Inference = mongoose.model('Inference', inferenceSchema);

// Connect
mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => {
    console.error('Mongo connect error', err);
    process.exit(1);
  });

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// Simple KM endpoints
app.post('/km/knowledge', async (req, res) => {
  const k = new Knowledge(req.body);
  await k.save();
  res.status(201).json(k);
});

app.get('/km/knowledge', async (req, res) => {
  const items = await Knowledge.find().limit(50).lean();
  res.json({ count: items.length, items });
});

// Inference endpoint (placeholder)
app.post('/km/infer', async (req, res) => {
  const { input } = req.body;
  // بسيط: يخزن السياق ثم يرد برد اصطناعي كدليل عمل للنواة
  const ctx = new Context({ sessionId: req.body.sessionId || 'anon', text: input, meta: {} });
  await ctx.save();
  const inf = new Inference({ inputRef: ctx._id, result: { reply: 'هذا رد تجريبي من نواة SIRAJ' }, metrics: { latency_ms: 12 }});
  await inf.save();
  res.json({ inference: inf });
});

// Metrics endpoint بسيطة للـ Monitor
app.get('/monitor/metrics', async (req, res) => {
  // لا تعالج بالاستدعاء الثقيل هنا. مجرد نقطة بداية.
  res.json({ uptime: process.uptime(), memory: process.memoryUsage(), loadavg: require('os').loadavg() });
});

app.listen(PORT, () => console.log(`SIRAJ API running on :${PORT}`));
EOF

# 4) خدمة systemd --user unit لبدء التطبيق محلياً (بديل أو مكمل للدِوكر)
cat > service/start-siraj.service <<'EOF'
[Unit]
Description=SIRAJ Phase1 (user)
After=network.target

[Service]
Type=simple
EnvironmentFile=%h/siraj_phase1/.env.example
WorkingDirectory=%h/siraj_phase1/api
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

# 5) وحدة تعلم ذاتي أولية: ملف docs/self_learning.md
cat > docs/self_learning.md <<'EOF'
SIRAJ Self-Learning Module - Phase1 (placeholder)
- سجل كل تفاعل في collections: Context, Inference
- اجعل replay buffer من Inference.entries لتحليل الأداء الدوري
- نقاط قياس مبدئية: latency_ms, success_flag, confidence_score
- جدولة مهمة CRON لتحليل آخر 1000 تفاعل وتوليد تقارير تحسين
EOF

# 6) ملف run-instructions.txt مختصر
cat > docs/run-instructions.txt <<EOF
SIRAJ Phase1 - تعليمات سريعة

1) تشغيل باستخدام Docker Compose (مفضل للتكامل السريع)
   docker-compose up --build -d

2) البدء محلياً (بدون دوكر) - لبناء API محلياً:
   cd api
   npm ci
   NODE_ENV=production PORT=${PORT} MONGO_URI="mongodb://localhost:27017/siraj" node index.js

3) تشغيل systemd user unit:
   cp service/start-siraj.service ~/.config/systemd/user/start-siraj.service
   systemctl --user daemon-reload
   systemctl --user enable --now start-siraj.service
   systemctl --user status start-siraj.service

4) فتح نفق ngrok (اختياري)
   export NGROK_AUTHTOKEN=your_token_here
   ngrok http ${PORT}

5) اختبارات سريعة:
   curl http://localhost:${PORT}/health
   curl -X POST http://localhost:${PORT}/km/knowledge -H "Content-Type: application/json" -d '{"title":"اختبار","content":"محتوى"}'
   curl -X POST http://localhost:${PORT}/km/infer -H "Content-Type: application/json" -d '{"input":"مرحباً"}'
EOF

# 7) إنشاء سكربت صغير لبناء وتشغيل الدوكر بسرعة
cat > infra/up.sh <<'EOF'
#!/usr/bin/env bash
set -e
docker-compose up --build -d
echo ">> انتظر حتى يبدأ Mongo وخادم SIRAJ. تحقق عبر: docker-compose logs -f siraj-api"
EOF
chmod +x infra/up.sh

# 8) تركيب التبعيات المحلية في مجلد api (لتجربة بدون دوكر)
echo ">> تثبيت تبعيات Node محلياً (داخل api) -- سيأخذ وقتاً"
cd api
npm ci --silent
cd ..

# 9) إرشاد نهائي
echo ">> انتهى إنشاء الملفات. المحتوى موجود في: $PROJECT_DIR"
echo ">> الملفات الرئيسة: docker-compose.yml, api/, service/start-siraj.service, docs/run-instructions.txt"
echo ""
echo ">> أوامر مقترحة للتشغيل الآن:"
echo "   1) docker-compose up --build -d"
echo "   2) (بعد نجاح) curl http://localhost:${PORT}/health"
echo ""
echo ">> إذا أردت، أستطيع الآن توليد:"
echo "   • سكربت نسخ احتياطي لقاعدة البيانات Mongo"
echo "   • ملف Prometheus scrape config وGrafana dashboard json"
echo "   • وحدة self-learning أكثر تقدماً (replay, metric collectors, trainer)"
echo ""
echo ">> انتهى."
