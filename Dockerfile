# syntax=docker/dockerfile:1.7
# ---------------------------------------------------------------------------
# NoClue Industries — production image (Next.js standalone + Payload CMS)
#
#   docker build -t noclue-industries .
#
# The build needs NO database: all pages render dynamically at request time.
# Database migrations run automatically when the server boots (Payload
# `prodMigrations`), before the first request is served.
# ---------------------------------------------------------------------------

ARG NODE_VERSION=24.22.1

FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
WORKDIR /app

# ---- dependencies (cached unless the lockfile changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ---- build ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time. Pass them as build args in Coolify.
ARG NEXT_PUBLIC_SERVER_URL=https://noclue.industries
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY=
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NODE_ENV=production
# Payload validates config at build time; these placeholders are never used at runtime.
RUN PAYLOAD_SECRET=build-time-placeholder \
    DATABASE_URL=postgres://build:build@localhost:5432/build \
    pnpm build

# ---- runtime ----
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat wget tini
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    MEDIA_DIR=/app/media

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs \
 && mkdir -p /app/media /app/.next/cache && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
VOLUME ["/app/media"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/healthz >/dev/null || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
