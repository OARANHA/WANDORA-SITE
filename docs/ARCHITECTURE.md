# Arquitetura do WANDORA-SITE

## Responsabilidade

`WANDORA-SITE` é a superfície pública de aquisição e diagnóstico da Wandora. Ele não é o Wandora Core, não é o app autenticado e não deve assumir autorização, tenancy, funcionários digitais ou estados operacionais que pertencem ao produto principal.

## Estado local

O site persiste apenas dados diretamente ligados ao funil público atual:

- diagnósticos anônimos;
- eventos agregáveis do funil;
- contato fornecido com consentimento;
- enriquecimento interno do lead.

SQLite é suficiente para o primeiro deploy isolado. Quando o site for conectado ao produto principal, a migração de lead/diagnóstico para um contrato de ingestão Wandora deve ser decidida explicitamente; não é necessário acoplar o site ao Supabase/Core antes disso.

## Edge e deploy

O container `wandora-site` participa da rede externa `wandora-edge` e não publica portas do host. O Traefik existente faz o roteamento HTTPS por configuração dinâmica versionada no repositório principal `OARANHA/wandora`.

Portainer é apenas o operador do stack. O Git permanece como fonte de verdade.

## Pendências antes do go-live

1. Confirmar o número real de WhatsApp comercial.
2. Criar/definir o repositório remoto definitivo do site.
3. Validar build Docker e healthcheck na VPS.
4. Adicionar a rota `wandora.com.br`/`www.wandora.com.br` ao Traefik no repositório principal.
5. Definir a política de backup do volume `wandora-site-data`.
6. Substituir ou formalizar o provider de IA herdado do ambiente Z.ai.
