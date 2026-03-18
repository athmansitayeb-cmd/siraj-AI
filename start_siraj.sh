#!/bin/bash

# =============================================
# سكربت تشغيل متكامل لمشروع SIRAJ
# Backend + React Frontend + Monitor + ngrok
# =============================================

# --- تنظيف المنافذ ---
sudo fuser -k 3000/tcp 2>/dev/null
sudo fuser -k 4040/tcp 2>/dev/null

# --- قتل أي ngrok شغال ---
pkill -f ngrok 2>/dev/null

# --- إيقاف وحذف كل تطبيقات PM2 ---
pm2 stop all
pm2 delete all

# --- تشغيل Backend و Monitor عبر PM2 ---
pm2 start ~/siraj/backend/core/fusion_api_server.cjs --name siraj-backend
pm2 start ~/siraj/backend/monitor/server.js --name siraj-monitor
pm2 save

# --- تشغيل React frontend في الخلفية ---
cd ~/siraj/frontend-react
export PORT=3000
nohup npm start > frontend.log 2>&1 &

# --- تشغيل ngrok على المنفذ الصحيح (frontend React) ---
ngrok http 3000 --log=stdout &

# --- انتظار ngrok حتى ينشئ النفق ---
echo "🔄 انتظار ngrok..."
NGROK_URL=""
for i in {1..20}; do
    NGROK_URL=$(curl -s http://127.0.0.1:4040/api/tunnels | jq -r '.tunnels[0].public_url' 2>/dev/null)
    if [[ "$NGROK_URL" != "null" && "$NGROK_URL" != "" ]]; then
        break
    fi
    sleep 1
done

# --- طباعة النتيجة وفتح المتصفح ---
echo "🌌 سِراج يعمل الآن."
echo "🌐 رابط ngrok: ${NGROK_URL:-غير متوفر}"
echo "📂 Logs:"
echo "    Backend: pm2 logs siraj-backend"
echo "    Monitor: pm2 logs siraj-monitor"
echo "    Frontend: frontend.log"

# فتح المتصفح تلقائيًا على الرابط الخارجي إذا متوفر
if [[ -n "$NGROK_URL" ]]; then
    xdg-open "$NGROK_URL" 2>/dev/null || echo "⚠️ لم يتمكن النظام من فتح المتصفح تلقائيًا."
fi
