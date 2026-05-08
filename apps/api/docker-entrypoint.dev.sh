#!/bin/sh
set -e

echo "Installing deps..."
pnpm install

echo "Building internal packages..."
pnpm --filter @repo/shared build
pnpm --filter @repo/config build
pnpm --filter @repo/database build



echo "Generating prisma..."
pnpm --filter @repo/database db:generate
echo "Running seed..."
pnpm --filter @repo/database db:seed

echo "Starting api dev with nodemon..."
cd apps/api

exec pnpm exec nodemon -L \
  --watch src \
  --watch ../../packages/shared/src \
  --watch ../../packages/config/src \
  --watch ../../packages/database/src \
  --ext ts,json \
  --signal SIGTERM \
  --exec "pnpm --dir ../.. --filter @repo/shared build && pnpm --dir ../.. --filter @repo/config build && pnpm --dir ../.. --filter @repo/database build && node -r ts-node/register -r tsconfig-paths/register src/main.ts"