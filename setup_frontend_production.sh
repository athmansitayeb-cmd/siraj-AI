#!/bin/bash
# =========================
# SIRAJ FRONTEND PRODUCTION SETUP
# =========================

echo "🚀 Starting SIRAJ Frontend Production Setup..."

# 1️⃣ تثبيت dependencies
cd /opt/siraj/frontend-react || exit
echo "📦 Installing frontend dependencies..."
npm install

# 2️⃣ Build المشروع
echo "🏗 Building React frontend..."
npm run build

# 3️⃣ تشغيل build عبر serve + PM2
echo "🖥 Setting up PM2 process..."
pm2 delete siraj-frontend 2>/dev/null
pm2 serve build 3000 --name siraj-frontend --spa

# 4️⃣ تأكيد التشغيل
echo "✅ Frontend running under PM2:"
pm2 list

# 5️⃣ Optionally: إعداد ngrok للتواصل الخارجي (HTTP tunneling)
if ! command -v ngrok &> /dev/null
then
    echo "⚡ Installing ngrok..."
    npm install -g ngrok
fi

# تشغيل ngrok على البورت 3000
echo "🌐 Starting ngrok tunnel on port 3000..."
ngrok http 3000 --log=stdout &

echo "🎉 Frontend Production Setup Completed!"
