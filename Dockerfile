FROM node:22-bookworm-slim AS base

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build

ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=file:/tmp/wandora-site-build.db
WORKDIR /app

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY eslint.config.mjs next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src

RUN npm run typecheck && npm run lint && npm run build

FROM base

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/wandora-site.db \
    WANDORA_SITE_DB_PUSH=1

WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/wandora-site-entrypoint

USER root
RUN mkdir -p /app/data \
    && chown -R node:node /app/data \
    && chmod 0755 /usr/local/bin/wandora-site-entrypoint

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/wandora-site-entrypoint"]
