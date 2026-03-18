#!/bin/bash

export PM2_HOME="$HOME/.pm2"

# ==== Backend ====
cd "$HOME/siraj/backend" || exit 1
if ! pm2 list | grep -q "siraj"; then
  pm2 start index.cjs --name siraj
fi

# تحقق أن SIRAJ يعمل على المنفذ 3000
RETRIES=5
while ! ss -lntp | grep -q ":3000"; do
  echo "انتظار تشغيل SIRAJ على المنفذ 3000..."
  sleep 2
  ((RETRIES--))
  if [ $RETRIES -le 0 ]; then
    echo "خطأ: SIRAJ لم يبدأ على المنفذ 3000"
    exit 1
  fi
done
echo "SIRAJ يعمل بنجاح على المنفذ 3000"

# ==== Ngrok ====
if ! pm2 list | grep -q "ngrok"; then
  pm2 start "$HOME/siraj/ngrok.sh" --name ngrok
fi

# تحقق أن ngrok بدأ النفق
sleep 5
NGROK_RETRIES=5
until curl -s localhost:4040/api/tunnels | grep -q "public_url"; do
  echo "انتظار ngrok لإنشاء النفق..."
  sleep 3
  ((NGROK_RETRIES--))
  if [ $NGROK_RETRIES -le 0 ]; then
    echo "خطأ: ngrok لم يبدأ النفق بعد"
    exit 1
  fi
done

# ==== حفظ الحالة وngrok URL ====
pm2 save
bash "$HOME/siraj/save_ngrok_url.sh"
echo "SIRAJ جاهز والرابط الخارجي محفوظ في url.txt"
