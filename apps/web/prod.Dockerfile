FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN corepack enable


FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile


FROM deps AS build

COPY . .

RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/config build
RUN pnpm --filter web build


FROM base AS runner

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
COPY --from=build /app/apps/web/next.config.* ./apps/web/

CMD ["pnpm", "--filter", "web", "start", "--hostname", "0.0.0.0"]