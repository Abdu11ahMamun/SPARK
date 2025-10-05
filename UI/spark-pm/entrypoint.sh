#!/bin/sh
set -e

API_BASE_URL=${API_BASE_URL:-http://localhost:8080}
TEMPLATE=/usr/share/nginx/html/runtime-env.template.js
TARGET=/usr/share/nginx/html/runtime-env.js

if [ -f "$TEMPLATE" ]; then
  echo "Generating runtime-env.js with API_BASE_URL=$API_BASE_URL"
  sed "s|__API_BASE_URL__|$API_BASE_URL|g" "$TEMPLATE" > "$TARGET"
fi

exec nginx -g 'daemon off;'