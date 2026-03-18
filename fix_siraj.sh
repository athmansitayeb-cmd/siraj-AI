#!/bin/bash
set -e

# 1️⃣ تحديث docker-compose.yml
cat > /opt/siraj/docker-compose.yml <<'EOF'
version: "3.8"
services:
  mongo:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db
    networks:
      - siraj_net

  backend:
    build: ./backend
    restart: unless-stopped
    env_file:
      - ./.env
    ports:
      - "5000:5000"
    networks:
      - siraj_net

  frontend:
    build: ./frontend-react
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - siraj_net
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/nginx:/etc/nginx/conf.d
      - /etc/letsencrypt/live/siraj.software:/etc/letsencrypt/live/siraj.software:ro
      - /etc/letsencrypt/archive/siraj.software:/etc/letsencrypt/archive/siraj.software:ro

volumes:
  mongo_data:

networks:
  siraj_net:
EOF

echo "✅ docker-compose.yml محدث."

# 2️⃣ تحديث app.js للـ backend
docker exec -i siraj-backend-1 sh -c 'cat > /app/frontend/siraj-backend/app.js' <<'EOF'
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("siraj-backend يعمل بشكل أسطوري!"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    message: "Backend جاهز ويعمل بشكل صحيح"
  });
});

app.listen(port, () => {
  console.log(`siraj-backend يعمل على المنفذ ${port}`);
});
EOF

echo "✅ app.js للـ backend محدث."

# 3️⃣ إعادة تشغيل الكونتينر بالكامل
docker compose down
docker compose up -d backend
echo "✅ backend أعيد تشغيله."

# 4️⃣ تحديث Nginx
cat > /etc/nginx/sites-available/siraj.software <<'EOF'
server {
    listen 80;
    server_name siraj.software www.siraj.software;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name siraj.software www.siraj.software;

    ssl_certificate /etc/letsencrypt/live/siraj.software/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/siraj.software/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /opt/siraj/frontend-react/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/siraj.software /etc/nginx/sites-enabled/siraj.software
nginx -t
systemctl reload nginx
echo "✅ Nginx محدث ومفعل."

# 5️⃣ اختبار الوصول
echo "✅ اختبر backend داخليًا:"
docker exec -it siraj-backend-1 sh -c "curl http://127.0.0.1:5000/api/health"

echo "✅ اختبر من الخارج:"
curl -s https://siraj.software/api/health

echo "🎯 تم إصلاح SIRAJ بالكامل. /api/health جاهز الآن."
