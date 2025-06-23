#!/bin/sh

set -e

# Set default values for database connection
POSTGRES_HOST=${POSTGRES_HOST:-"postgres"}
POSTGRES_PORT=${POSTGRES_PORT:-"5432"}

echo "🕓 Waiting for PostgreSQL to be ready at $POSTGRES_HOST:$POSTGRES_PORT..."

until nc -z -v -w30 "$POSTGRES_HOST" "$POSTGRES_PORT"; do
  echo "Waiting for database connection..."
  sleep 2
done

echo "✅ PostgreSQL is up - running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting NestJS application..."
if [ "$NODE_ENV" = "production" ]; then
  exec npm run start:prod
else
  exec npm run start:dev
fi