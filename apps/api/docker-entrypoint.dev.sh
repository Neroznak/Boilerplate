#!/bin/sh

set -e

echo "Installing deps..."
pnpm install

echo "Generating prisma..."
pnpm --filter @repo/database db:generate

echo "Starting api dev with nodemon..."

cd apps/api

pnpm exec nodemon -L \
  --watch src \
  --watch ../../packages \
  --ext ts,json \
  --signal SIGTERM \
  --exec "node -r ts-node/register -r tsconfig-paths/register src/main.ts"