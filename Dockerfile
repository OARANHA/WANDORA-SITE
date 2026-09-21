FROM oven/bun:1.3.4 AS build

ENV NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_URL=file:/tmp/wandora-site-build.db
WORKDIR /app

COPY package.json ./
RUN bun install

COPY prisma ./prisma
RUN bunx prisma generate

COPY eslint.config.mjs next.config.ts postcss.config.mjs tailwind.config.ts tsconfig.json ./
COPY public ./public
COPY src ./src

RUN bun run typecheck && bun run lint && bun run build

FROM oven/bun:1.3.4

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL=file:/app/data/wandora-site.db \
    WANDORA_SITE_DB_PUSH=1

WORKDIR /app

COPY --from=build --chown=bun:bun /app/package.json ./
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static
COPY --from=build --chown=bun:bun /app/public ./public
COPY --from=build --chown=bun:bun /app/prisma ./prisma
COPY --chown=bun:bun docker/entrypoint.sh /usr/local/bin/wandora-site-entrypoint

USER root
RUN mkdir -p /app/data \
    && chown -R bun:bun /app/data \
    && chmod 0755 /usr/local/bin/wandora-site-entrypoint

USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/wandora-site-entrypoint"]
