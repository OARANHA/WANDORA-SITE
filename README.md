# WANDORA-SITE

Site público da Wandora, separado do produto autenticado em `app.wandora.com.br`.

A base atual é uma aplicação Next.js com diagnóstico interativo, cálculo de ROI, captura de lead com consentimento, estatísticas agregadas e geração opcional de plano/enriquecimento por IA com fallback determinístico.

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS
- Prisma + SQLite para o estado próprio do site
- Docker / Compose compatível com Portainer
- Traefik da infraestrutura Wandora como ingress

## Desenvolvimento local

```bash
cp .env.example .env
bun install --frozen-lockfile
bun run db:push
bun run dev
```

Verificações:

```bash
bun run typecheck
bun run lint
bun run build
```

## Deploy na VPS Wandora

O `compose.yaml` foi preparado para deploy por repositório Git no Portainer. Ele:

- não publica porta no host;
- entra apenas na rede externa `wandora-edge` já usada pela infraestrutura Wandora;
- mantém o SQLite em volume persistente `wandora-site-data`;
- executa como usuário não-root e com filesystem somente leitura fora do volume de dados;
- expõe readiness em `/api/health`;
- sincroniza o schema Prisma no boot sem aceitar perda destrutiva automaticamente.

O Traefik da VPS usa **file provider**, não labels Docker. Portanto o roteamento público deve continuar versionado no repositório `OARANHA/wandora`. Um candidato está em `docs/traefik-wandora-site.example.yml` para futura integração/revisão no repositório principal.

## Limites atuais

A integração de IA existente usa `z-ai-web-dev-sdk`, herdado do ambiente de origem. As rotas têm fallback determinístico, então o site continua funcional sem esse serviço, mas essa integração deve ser substituída por um contrato/provider Wandora antes de ser tratada como dependência de produção.

O número comercial de WhatsApp ainda está como placeholder em `src/lib/wandora/config.ts` e precisa ser configurado antes da publicação final.

## Relação com `OARANHA/wandora`

Este repositório é o site público/marketing. O repositório principal continua sendo a autoridade de produto, arquitetura e infraestrutura compartilhada. A integração futura deve ocorrer por contratos explícitos, sem copiar o domínio do Core para dentro do site.
