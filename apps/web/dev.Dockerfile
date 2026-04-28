FROM node:22-bookworm-slim

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile

CMD ["pnpm", "--filter", "web", "dev", "--hostname", "0.0.0.0"]