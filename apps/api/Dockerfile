FROM node:20-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

CMD ["pnpm", "--filter", "api", "start:dev"]