#!/bin/bash

# finalize_siraj.sh
# =================================
# سكربت تجهيز النسخة النهائية لمشروع SIRAJ
# =================================

echo "🟢 بدء تجهيز النسخة النهائية..."

# -----------------------------
# 1️⃣ بناء React frontend
# -----------------------------
echo "📦 بناء React frontend..."
cd ~/siraj/frontend-react
npm install
npm run build

# -----------------------------
# 2️⃣ تشغيل backend عبر PM2
# -----------------------------
echo "⚡ تشغيل backend عبر PM2..."
cd ~/siraj/backend/core

# إذا كان التطبيق قيد التشغيل بالفعل، أعد التشغيل بالقوة
pm2 start fusion_api_server.cjs --name siraj-backend -f

# -----------------------------
# 3️⃣ دمج تقارير Fusion في CSV
# -----------------------------
echo "📝 دمج تقارير Fusion في CSV..."
REPORTS_DIR=~/siraj/backend/core
OUTPUT_CSV=~/siraj/fusion_reports_final.csv

# تهيئة CSV
echo "cycle,latency,heapUsedMB,note,timestamp" > $OUTPUT_CSV

# دمج جميع الملفات
for file in $REPORTS_DIR/fusion_*.json; do
  if [[ -f "$file" ]]; then
    jq -r '.report[] | "\(.cycle),\(.latency),\(.heapUsedMB),\(.note),\(.timestamp)"' "$file" >> $OUTPUT_CSV 2>/dev/null || true
  fi
done

echo "✅ Fusion CSV جاهز: $OUTPUT_CSV"

# -----------------------------
# 4️⃣ توليد README نهائي
# -----------------------------
echo "📖 توليد README نهائي..."
README_FINAL=~/siraj/README_FINAL.md
cat <<EOT > $README_FINAL
# SIRAJ - النسخة النهائية

- Backend API: http://localhost:7070/api/v1
  - Health: /health
  - Fusion Latest: /fusion/latest
  - Fusion Metrics: /fusion/metrics

- Frontend: ~/siraj/frontend-react/build
- CSV Fusion Reports: $OUTPUT_CSV
EOT

echo "🎯 النسخة النهائية جاهزة!"
