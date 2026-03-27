FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/bot/package.json apps/bot/
RUN pnpm install --frozen-lockfile --filter @osonprava/bot...

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY apps/bot/ apps/bot/
RUN pnpm --filter @osonprava/bot build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/node_modules ./node_modules
COPY --from=builder /app/apps/bot/package.json ./

EXPOSE 3002
CMD ["node", "dist/index.js"]
