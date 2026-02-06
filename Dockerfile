FROM node:24-alpine3.22 AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- SCRIPTS ---
COPY .docker/scripts/install-deps.sh /usr/local/bin/install-deps
COPY .docker/scripts/build-app.sh /usr/local/bin/build-app
COPY .docker/scripts/start-server.sh /usr/local/bin/start-server

RUN chmod +x /usr/local/bin/install-deps \
     /usr/local/bin/build-app \
     /usr/local/bin/start-server

# --- DEPS ---
FROM base AS deps
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN install-deps

# --- BUILDER ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN build-app

# --- RUNNER ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["start-server"]