#!/bin/sh
set -eu

cd /app/backend

i=0
while ! nc -z "${MYSQL_HOST:-mysql}" 3306; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "MySQL did not become ready in time" >&2
    exit 1
  fi
  echo "Waiting for MySQL (${i}/60)…"
  sleep 2
done

echo "Applying database schema (prisma db push)…"
npx prisma db push --skip-generate

exec node dist/main.js
