# Auditoria da fonte recebida

Fonte analisada: `workspace-site01_zchat.tar`.

## Aplicação preservada

Foram preservados o site Next.js, a identidade visual atual, todos os assets publicados, o diagnóstico de 7 perguntas, as 5 trilhas, ROI, matriz comparativa, plano de 30 dias, captura de lead, estatísticas e as APIs `/api/wandora/*`.

## Artefatos que não pertencem ao repositório de produção

A fonte recebida também continha elementos do ambiente de geração/desenvolvimento que foram excluídos da base limpa:

- `.git` local sem remote configurado;
- `.zscripts/` específicos do sandbox de origem;
- `tool-results/` com screenshots e dumps de verificação;
- `upload/` com anexos intermediários;
- `agent-ctx/`, `examples/` e testes de runtime do ambiente de origem;
- `.env` absoluto do sandbox;
- `db/custom.db` de desenvolvimento.

O banco local tinha apenas estado de teste e nenhum contato capturado. Ele não foi promovido para a base de produção.

## Repositório remoto já existente

Na conta GitHub existe `OARANHA/wandora_site`, atualmente privado e baseado em Vite/Google AI Studio. Ele é diferente desta aplicação Next.js e, por segurança, não foi sobrescrito durante a auditoria.

## Infraestrutura Wandora consultada

O repositório principal `OARANHA/wandora` define hoje:

- Git como fonte de verdade;
- Docker Compose / Portainer como modelo operacional;
- Traefik via file provider;
- rede externa `wandora-edge`;
- ausência de portas públicas nos containers de aplicação;
- `app.wandora.com.br` reservado à experiência autenticada do produto.

A base preparada aqui segue esses limites e mantém o site público separado do app autenticado.
