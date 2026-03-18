#!/bin/bash
# ------------------------------------------
# إعداد SIRAJ للإنتاج: Backend + Frontend + PM2 + Nginx + HTTPS
# ------------------------------------------

# 1️⃣ تحديث النظام وتثبيت الحزم الأساسية
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# 2️⃣ بناء frontend React
cd ~/siraj/frontend-react || exit
npm install
npm run build

# 3️⃣ نسخ build إلى backend
rm -rf ~/siraj/backend/build
cp -r ~/siraj/frontend-react/build ~/siraj/backend/

# 4️⃣ تشغيل backend مع PM2
cd ~/siraj/backend || exit
pm2 delete siraj-backend 2>/dev/null || true
pm2 start core/fusion_api_server_prod.cjs --name siraj-backend --update-env
pm2 save
pm2 startup systemd -u athman --hp /home/athman

# 5️⃣ إعداد Nginx كـ Reverse Proxy
sudo tee /etc/nginx/sites-available/siraj >/dev/null <<'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:7070;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/siraj /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6️⃣ السماح بالـ Firewall
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 7️⃣ تثبيت HTTPS تلقائي مع Let's Encrypt
sudo certbot --nginx -d YOUR_DOMAIN_OR_IP --non-interactive --agree-tos -m your_email@example.com

# 8️⃣ التحقق من تشغيل الخدمة
echo "[✓] Backend + Frontend should be running via PM2"
curl -sf http://localhost:7070/api/v1/health && echo "✔ backend OK"
curl -sf http://localhost:7070/api/v1/fusion/latest && echo "✔ frontend React + Fusion OK"

echo "[✓] Setup complete. Access your site at https://YOUR_DOMAIN_OR_IP"
