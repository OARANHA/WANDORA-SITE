#!/bin/sh
set -eu

if [ "${WANDORA_SITE_DB_PUSH:-1}" = "1" ]; then
  echo "[wandora-site] syncing database schema"
  ./node_modules/.bin/prisma db push --skip-generate
fi

exec bun server.js
