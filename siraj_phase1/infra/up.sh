#!/usr/bin/env bash
set -e
docker-compose up --build -d
echo ">> انتظر حتى يبدأ Mongo وخادم SIRAJ. تحقق عبر: docker-compose logs -f siraj-api"
