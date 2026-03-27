FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/app/package.json apps/app/
RUN pnpm install --frozen-lockfile --filter @osonprava/app...

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY apps/app/ apps/app/
ARG VITE_API_URL=https://api.osonprava.uz/api/v1
ARG VITE_SOCKET_URL=https://api.osonprava.uz
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN pnpm --filter @osonprava/app build

# Runner — static files served by nginx
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/app/dist /var/www/app
EXPOSE 80
