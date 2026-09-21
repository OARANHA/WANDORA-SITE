// ============================================================
// Wandora — configuração da marca
// Centralize aqui tudo que é específico da Wandora.
// ============================================================

export const WANDORA = {
  name: "Wandora",
  tagline: "Funcionários Digitais com IA",
  description:
    "A Wandora cria Funcionários Digitais com Inteligência Artificial: agentes que atendem, vendem, qualificam e operam processos de ponta a ponta — 24 horas por dia.",
  url: "https://wandora.com.br",

  // ⚠️ TROCAR pelo número real do WhatsApp comercial da Wandora
  // Formato internacional sem "+" nem espaços: 55 + DDD + número
  whatsapp: "5511999999999",

  // Nome do funcionário digital de vendas da Wandora (atende o WhatsApp)
  assistantName: "Aurora",
} as const;

// URL base das APIs (rota única do site: /)
export const API = {
  events: "/api/wandora/events",
  diagnostic: "/api/wandora/diagnostic",
  stats: "/api/wandora/stats",
  lead: "/api/wandora/lead",
  plan: "/api/wandora/plan",
} as const;
