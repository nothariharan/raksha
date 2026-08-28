# ==============================================================================
# Multi-stage Production Dockerfile for Raksha Protocol
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10.32.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY services/ ./services/
COPY apps/ ./apps/
COPY agents/ ./agents/
COPY scripts/ ./scripts/
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile
RUN pnpm build

# ------------------------------------------------------------------------------
# Production Runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g pnpm@10.32.1

COPY --from=builder /app ./

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["pnpm", "start"]
