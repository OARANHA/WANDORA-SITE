// ============================================================
// Wandora — motor do Diagnóstico de IA
// Perguntas, trilhas, scoring, ROI e matriz de decisão.
// Compartilhado entre cliente (render instantâneo) e servidor.
// ============================================================

export type TrailKey =
  | "atendimento"
  | "sdr_vendas"
  | "operacao"
  | "painel"
  | "resgate";

export type UrgencyLevel = "baixa" | "media" | "alta";

export interface QuizOption {
  v: string;
  label: string;
  trilha?: TrailKey;
  urg?: number;
  clt?: boolean;
}

export interface Question {
  id: string;
  multi: boolean;
  key: string;
  eyebrow: string;
  title: string;
  hint?: string;
  options: QuizOption[];
}

export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue>;

// ------------------------------------------------------------
// As 7 perguntas
// ------------------------------------------------------------
export const QUESTIONS: Question[] = [
  {
    id: "p1",
    multi: false,
    key: "dor_p1",
    eyebrow: "Pergunta 1 · a dor nº1",
    title: "Qual frase descreve melhor a dor nº1 da sua empresa hoje?",
    options: [
      {
        v: "A",
        trilha: "atendimento",
        label: "“Chega lead/mensagem e a gente demora a responder — ou nem responde.”",
      },
      {
        v: "B",
        trilha: "sdr_vendas",
        label: "“Tenho lead, mas o time não dá conta de qualificar e agendar reunião.”",
      },
      {
        v: "C",
        trilha: "operacao",
        label: "“O time perde horas digitando, atualizando planilha/CRM, copiando dado de um sistema pro outro.”",
      },
      {
        v: "D",
        trilha: "painel",
        label: "“Vendo, mas não sei o que está acontecendo no funil — o CRM vive desatualizado.”",
      },
      {
        v: "E",
        trilha: "resgate",
        label: "“Já tentei bot/automação e não funcionou — foi frustrante.”",
      },
    ],
  },
  {
    id: "p2",
    multi: true,
    key: "canais",
    eyebrow: "Pergunta 2 · canais",
    title: "Por onde seus clientes mais falam com você?",
    hint: "Pode marcar mais de um.",
    options: [
      { v: "whatsapp", label: "WhatsApp" },
      { v: "instagram", label: "Instagram / Direct" },
      { v: "site", label: "Site / chat" },
      { v: "telefone", label: "Telefone" },
      { v: "email", label: "E-mail" },
      { v: "anuncios", label: "Anúncios (Meta/Google)" },
    ],
  },
  {
    id: "p3",
    multi: false,
    key: "p3",
    eyebrow: "Pergunta 3 · fora do horário",
    title:
      "Quando chega uma mensagem fora do horário comercial (noite, fim de semana), o que acontece?",
    options: [
      { v: "A", urg: 3, label: "Fica sem resposta até alguém ver no dia seguinte." },
      { v: "B", urg: 2, label: "Alguém responde do celular, quando dá." },
      { v: "C", urg: 2, label: "Tenho uma resposta automática genérica (“retornamos em breve”)." },
      { v: "D", urg: 1, label: "Já é atendido na hora, mas quero que venda melhor." },
    ],
  },
  {
    id: "p4",
    multi: false,
    key: "p4",
    eyebrow: "Pergunta 4 · tamanho do time",
    title:
      "Quantas pessoas hoje fazem atendimento, qualificação ou tarefas repetitivas no dia a dia?",
    options: [
      { v: "1-2", label: "1–2 pessoas" },
      { v: "3-5", label: "3–5 pessoas" },
      { v: "6-15", clt: true, label: "6–15 pessoas" },
      { v: "16+", clt: true, label: "16+ pessoas" },
    ],
  },
  {
    id: "p5",
    multi: false,
    key: "p5",
    eyebrow: "Pergunta 5 · seus sistemas",
    title: "Seus sistemas conversam entre si?",
    options: [
      { v: "A", label: "Uso CRM/ERP/sistema próprio, mas digito o mesmo dado em vários lugares." },
      { v: "B", label: "Vivo em planilha e WhatsApp, sem sistema central." },
      { v: "C", label: "Tenho sistemas, mas não sei se dá pra integrar." },
      { v: "D", label: "Já tudo integrado — quero é colocar IA pra trabalhar em cima disso." },
    ],
  },
  {
    id: "p6",
    multi: false,
    key: "intencao_90d",
    eyebrow: "Pergunta 6 · próximos 90 dias",
    title: "O que você mais quer que aconteça nos próximos 90 dias?",
    options: [
      { v: "A", label: "Parar de perder lead por demora na resposta." },
      { v: "B", label: "Agendar mais reuniões sem contratar mais gente." },
      { v: "C", label: "Liberar o time das tarefas repetitivas." },
      { v: "D", label: "Enxergar o funil de verdade e decidir com dado." },
      { v: "E", label: "Provar pra mim mesmo que IA funciona no meu negócio (depois escala)." },
    ],
  },
  {
    id: "p7",
    multi: false,
    key: "porte",
    eyebrow: "Pergunta 7 · porte da operação",
    title: "Qual o porte da operação?",
    options: [
      { v: "autonomo", label: "Profissional autônomo / consultório" },
      { v: "pequena", label: "Pequena empresa (até ~20 pessoas)" },
      { v: "media", label: "Média (20–200)" },
      { v: "grande", label: "Grande (200+)" },
      { v: "franquia", label: "Franquia / rede de unidades" },
    ],
  },
];

// ------------------------------------------------------------
// As 5 trilhas de resultado
// ------------------------------------------------------------
export interface Trail {
  label: string;
  verdict: string; // pode conter <em> e <strong>
  why: string;
  exec: string; // o que o funcionário digital executa
  proof: string; // prova com dado de mercado (sem citar concorrente)
  waText: string; // mensagem inicial para o WhatsApp da Wandora
}

export const TRAILS: Record<TrailKey, Trail> = {
  atendimento: {
    label: "Atendimento 24/7",
    verdict:
      "Seu ponto de partida: um <em>Funcionário Digital</em> que atende cada conversa na hora — 24 horas por dia, 7 dias por semana.",
    why:
      "Pelo que você respondeu, o dinheiro está vazando na espera: a mensagem que chega 22h fica sem resposta e o cliente, que tinha a carteira na mão, desiste até alguém ver no dia seguinte. Você não precisa de mais um robô de respostas prontas — precisa de quem <strong>EXECUTA</strong> o atendimento de ponta a ponta: entende o contexto, responde como a sua marca falaria, resolve e só passa pro humano o que realmente precisa de humano.",
    exec:
      "atende toda mensagem na hora · qualifica · resolve dúvidas com a voz da sua marca · registra tudo no Painel Inteligente · escala o caso certo pro time. Integra com WhatsApp, Instagram e os sistemas que você já usa.",
    proof:
      "quem responde um lead em até 5 minutos tem até <strong>7× mais chance</strong> de qualificar a conversa do que quem demora 1 hora — e a maioria dos leads compra de quem respondeu <strong>primeiro</strong> (estudos de lead response, HBR/InsideSales).",
    waText:
      "Vim do Diagnóstico de IA da Wandora. Minha trilha foi: Atendimento 24/7. Quero um Funcionário Digital que atenda cada conversa na hora, 24/7 — por onde começo?",
  },
  sdr_vendas: {
    label: "SDR / Vendas",
    verdict:
      "Seu ponto de partida: um <em>Funcionário Digital</em> que prospecta, qualifica e agenda a reunião — enquanto seu time dorme.",
    why:
      "Você tem lead; o gargalo é transformar lead em reunião sem queimar o time (e sem depender de um SDR caro que pede as contas na primeira proposta melhor). O <em>Funcionário Digital</em> da <strong>Wandora</strong> assume a primeira conversa, qualifica com método (SPIN), e entrega a reunião agendada — cada lead trabalhado, nenhum esfriando na fila.",
    exec:
      "aborda e responde na hora · qualifica e pontua o lead · agenda a reunião na agenda certa · atualiza o estágio no Painel Inteligente · passa o lead quente pro closer com o contexto pronto.",
    proof:
      "a maioria das decisões de compra começa em quem <strong>respondeu primeiro</strong> — e times que padronizam qualificação e follow-up agendam consistentemente mais reuniões sem aumentar cabeça (benchmark comercial B2B).",
    waText:
      "Vim do Diagnóstico de IA da Wandora. Minha trilha foi: SDR / Vendas. Quero entender como o Funcionário Digital qualifica e agenda reunião no meu caso.",
  },
  operacao: {
    label: "Operação & Backoffice",
    verdict:
      "Seu ponto de partida: tirar do time humano a tarefa repetitiva — e colocar um <em>Funcionário Digital</em> pra EXECUTAR.",
    why:
      "Suas respostas mostram horas do time consumidas digitando, copiando dado de um sistema pro outro, atualizando planilha. Isso não é trabalho de gente — é exatamente o que um <em>Funcionário Digital</em> executa sem cansar, sem errar e sem fim de expediente. A Wandora automatiza <strong>qualquer processo</strong> e integra <strong>qualquer sistema com API</strong>: vendas, atendimento, operação, backoffice, financeiro.",
    exec:
      "registra e move dados entre os sistemas · dispara o follow-up que ninguém lembra · cobra, confirma, lembra · monta relatório · e devolve cada resultado pronto pro time humano.",
    proof:
      "estudos de produtividade mostram que times passam <strong>mais da metade da semana</strong> em “trabalho sobre o trabalho” — digitação, apontamento, busca de informação. É exatamente essa fatia que a IA devolve pro time.",
    waText:
      "Vim do Diagnóstico de IA da Wandora. Minha trilha foi: Operação & Backoffice. Quero desenhar quais processos saem da fila do meu time primeiro.",
  },
  painel: {
    label: "Painel / Dados",
    verdict:
      "Seu ponto de partida: um funil que se preenche sozinho — o Painel Inteligente que mostra o que está acontecendo de verdade.",
    why:
      "Você vende, mas decide no escuro porque o CRM vive desatualizado — ninguém tem tempo de alimentar. O problema não é o CRM; é que preencher CRM é trabalho que ninguém faz. Com a Wandora, <strong>a conversa vira venda e vira dado</strong>: cada atendimento que o <em>Funcionário Digital</em> executa já entra no Painel Inteligente, sozinho, em tempo real.",
    exec:
      "registra cada conversa · atualiza o estágio do lead · extrai o que importa (intenção, objeção, próximo passo) · e te entrega o funil vivo, sem digitação manual.",
    proof:
      "sem follow-up consistente, a maior parte dos leads <strong>nunca converte</strong> — não por falta de interesse, mas por falta de dado vivo no funil. CRM que se preenche sozinho é a diferença entre adivinhar e decidir.",
    waText:
      "Vim do Diagnóstico de IA da Wandora. Minha trilha foi: Painel / Dados. Quero ver o funil se preencher sozinho enquanto a gente conversa.",
  },
  resgate: {
    label: "Resgate (já-tentei)",
    verdict:
      "Seu ponto de partida: entender por que o bot falhou — e por que um <em>Funcionário Digital</em> não é a mesma coisa.",
    why:
      "Você já tentou e se frustrou: o bot seguia script, travava fora do roteiro e empurrava o cliente de volta pra fila. Faz sentido a frustração — aquilo era um robô de respostas. <strong>Não é chatbot.</strong> Um <em>Funcionário Digital</em> se conecta aos seus sistemas, entende o contexto, <strong>toma decisões</strong> e leva o processo até o fim. E melhora: pela <strong>Memória de Longo Prazo</strong>, o atendimento de amanhã começa mais inteligente que o de hoje.",
    exec:
      "o que o bot não conseguia — sai do script, resolve o caso real, integra com seus sistemas e aprende com cada conversa.",
    proof:
      "a diferença entre travar no script e entender contexto é o que separa chatbot de funcionário digital — e é por isso que a segunda geração de automação recupera leads que a primeira perdeu.",
    waText:
      "Vim do Diagnóstico de IA da Wandora. Minha trilha foi: Resgate (já tentei bot). Quero sentir a diferença de um Funcionário Digital de verdade.",
  },
};

export const P1_TO_TRAIL: Record<string, TrailKey> = {
  A: "atendimento",
  B: "sdr_vendas",
  C: "operacao",
  D: "painel",
  E: "resgate",
};

// ------------------------------------------------------------
// Scoring
// ------------------------------------------------------------
export function urgencyScore(answers: Answers): number {
  const p3 = answers.p3;
  const q3 = QUESTIONS[2].options;
  for (const o of q3) {
    if (o.v === p3) return o.urg ?? 0;
  }
  return 0;
}

export function urgencyLevel(score: number): UrgencyLevel {
  // score 0–3 vem de p3: 3 = fica sem resposta, 2 = responde quando dá /
  // resposta genérica, 1 = já atende na hora
  if (score >= 3) return "alta";
  if (score >= 2) return "media";
  return "baixa";
}

export function p4HasClt(answers: Answers): boolean {
  return answers.p4 === "6-15" || answers.p4 === "16+";
}

/** Fit score comercial 0–100 (heurística determinística) */
export function fitScore(answers: Answers): number {
  let score = 30;
  const p1 = (answers.dor_p1 as string) || "A";
  const trail = P1_TO_TRAIL[p1] || "atendimento";

  // urgência
  score += urgencyScore(answers) * 6; // até +18

  // time
  if (p4HasClt(answers)) score += 18;
  else if (answers.p4 === "3-5") score += 10;

  // porte
  const porte = answers.porte;
  if (porte === "media") score += 10;
  else if (porte === "grande" || porte === "franquia") score += 14;
  else if (porte === "pequena") score += 7;

  // intenção 90d
  const intent = answers.intencao_90d;
  if (intent === "A" || intent === "B") score += 8;

  // canais (whatsapp/instagram/anuncios = volume conversacional)
  const canais = Array.isArray(answers.canais) ? answers.canais : [];
  if (canais.includes("whatsapp")) score += 6;
  if (canais.length >= 3) score += 4;

  // trilha resgate = ceticismo, leve desconto
  if (trail === "resgate") score -= 6;

  return Math.max(0, Math.min(100, score));
}

export interface ComputedResult {
  trailKey: TrailKey;
  trailLabel: string;
  urgency: number;
  urgencyLvl: UrgencyLevel;
  urgencyText: string;
  fit: number;
  clt: boolean;
}

export function computeResult(answers: Answers): ComputedResult {
  const p1 = (answers.dor_p1 as string) || "A";
  const trailKey = P1_TO_TRAIL[p1] || "atendimento";
  const t = TRAILS[trailKey];

  const urg = urgencyScore(answers);
  const lvl = urgencyLevel(urg);
  const clt = p4HasClt(answers);

  let urgencyText: string;
  if (lvl === "alta") {
    urgencyText =
      "Pela sua resposta, você está perdendo conversa fora do horário comercial <strong>agora</strong>. Cada noite e fim de semana sem atendimento é venda que vai pro concorrente que respondeu primeiro.";
  } else if (lvl === "media") {
    urgencyText =
      "Você já atende, mas dá pra atender melhor e na hora certa — e capturar o que escapa hoje.";
  } else {
    urgencyText =
      "Sua operação está estruturada. O próximo salto é colocar IA pra <strong>EXECUTAR</strong> e escalar sem contratar.";
  }
  if (clt) {
    urgencyText +=
      '<span class="clt">Com o tamanho do seu time, o ganho de horas é o que mais pesa: cada hora devolvida ao time é hora vendendo ou cuidando de cliente.</span>';
  }

  return {
    trailKey,
    trailLabel: t.label,
    urgency: urg,
    urgencyLvl: lvl,
    urgencyText,
    fit: fitScore(answers),
    clt,
  };
}

// ------------------------------------------------------------
// ROI — metodologia educativa (inputs ajustáveis no resultado)
// ------------------------------------------------------------
export interface RoiInputs {
  leadsMes: number; // conversas/leads por mês
  ticketMedio: number; // R$
  pctForaHorario: number; // 0-100
  horasRepetitivas: number; // horas/mês do time em tarefas repetitivas
}

export interface RoiOutput {
  conversasRecuperadas: number;
  horasLiberadas: number;
  receitaRecuperada: number; // R$/mês
  custoEvitado: number; // R$/mês
  ganhoTotal: number; // R$/mês
  roi12m: number; // x
  paybackDias: number;
}

const CUSTO_HORA_EQUIPE = 38; // R$/h (média carregada, estimativa)
const TAXA_RECUPERACAO = 0.4; // % das conversas fora do horário recuperadas
const CUSTO_FD_MES = 2400; // R$/mês (setup + mensalidade estimados)

export function computeRoi(i: RoiInputs): RoiOutput {
  const conversasRecuperadas = Math.round(
    i.leadsMes * (i.pctForaHorario / 100) * TAXA_RECUPERACAO
  );
  const receitaRecuperada = conversasRecuperadas * i.ticketMedio * 0.25; // 25% converte (conservador)
  const horasLiberadas = Math.round(i.horasRepetitivas * 0.7); // 70% automável
  const custoEvitado = horasLiberadas * CUSTO_HORA_EQUIPE;
  const ganhoTotal = receitaRecuperada + custoEvitado;
  const ganhoAno = ganhoTotal * 12;
  const custoAno = CUSTO_FD_MES * 12;
  const roi12m = custoAno > 0 ? ganhoAno / custoAno : 0;
  const paybackDias =
    ganhoTotal > 0 ? Math.ceil((CUSTO_FD_MES / ganhoTotal) * 30) : Infinity;

  return {
    conversasRecuperadas,
    horasLiberadas,
    receitaRecuperada,
    custoEvitado,
    ganhoTotal,
    roi12m,
    paybackDias,
  };
}

/** Estimativas iniciais de ROI a partir das respostas (o usuário ajusta depois) */
export function roiDefaultsFrom(answers: Answers, trail: TrailKey): RoiInputs {
  const porte = answers.porte;
  let leads = 150;
  if (porte === "autonomo") leads = 60;
  else if (porte === "pequena") leads = 200;
  else if (porte === "media") leads = 600;
  else if (porte === "grande" || porte === "franquia") leads = 1500;

  let pct = 45;
  const p3 = answers.p3;
  if (p3 === "A") pct = 55;
  else if (p3 === "B" || p3 === "C") pct = 45;
  else if (p3 === "D") pct = 25;

  let horas = 60;
  if (answers.p4 === "1-2") horas = 50;
  else if (answers.p4 === "3-5") horas = 110;
  else if (answers.p4 === "6-15") horas = 260;
  else if (answers.p4 === "16+") horas = 560;
  if (trail === "operacao") horas = Math.round(horas * 1.25);
  if (trail === "painel") horas = Math.round(horas * 1.15);

  return { leadsMes: leads, ticketMedio: 800, pctForaHorario: pct, horasRepetitivas: horas };
}

// ------------------------------------------------------------
// Matriz de decisão: chatbot vs agente de IA vs funcionário digital
// ------------------------------------------------------------
export type MatrixVerdict = "bom" | "excesso" | "limitado" | "fraco" | "variavel" | "forte";

export const COMPARISON_ROWS: {
  cenario: string;
  chatbot: MatrixVerdict;
  agente: MatrixVerdict;
  funcionario: MatrixVerdict;
}[] = [
  { cenario: "FAQ simples", chatbot: "bom", agente: "excesso", funcionario: "excesso" },
  { cenario: "Atendimento fora do horário", chatbot: "limitado", agente: "bom", funcionario: "forte" },
  { cenario: "Qualificação comercial", chatbot: "fraco", agente: "bom", funcionario: "forte" },
  { cenario: "Atualização de CRM", chatbot: "fraco", agente: "bom", funcionario: "forte" },
  { cenario: "Voz da marca", chatbot: "limitado", agente: "bom", funcionario: "forte" },
  { cenario: "Memória entre conversas", chatbot: "fraco", agente: "variavel", funcionario: "forte" },
  { cenario: "Integração com dados internos", chatbot: "limitado", agente: "bom", funcionario: "forte" },
  { cenario: "Processo com regra de negócio", chatbot: "fraco", agente: "bom", funcionario: "forte" },
];

export const MATRIX_LABEL: Record<MatrixVerdict, string> = {
  bom: "Bom",
  excesso: "Excesso",
  limitado: "Limitado",
  fraco: "Fraco",
  variavel: "Variável",
  forte: "Forte",
};

// ------------------------------------------------------------
// Plano 30 dias — fallback determinístico por trilha
// (o backend tenta gerar versão personalizada com LLM)
// ------------------------------------------------------------
export interface PlanWeek {
  titulo: string;
  descricao: string;
}

export interface Plan {
  resumo: string;
  semanas: PlanWeek[];
  dica: string;
}

export const FALLBACK_PLANS: Record<TrailKey, Plan> = {
  atendimento: {
    resumo:
      "Seu funil está perdendo conversa na espera. O caminho mais curto é colocar um Funcionário Digital de atendimento operando no seu canal mais movimentado — e medir tempo de primeira resposta desde o dia 1.",
    semanas: [
      {
        titulo: "Semana 1 · Desenho",
        descricao:
          "Mapear as 20 perguntas mais frequentes, definir a voz da marca e as regras de transferência pro humano (o que a IA resolve, o que sobe pro time).",
      },
      {
        titulo: "Semana 2 · Conexão",
        descricao:
          "Conectar o canal principal (WhatsApp e/ou Instagram), integrar agenda e base de conhecimento. Teste interno com conversas reais.",
      },
      {
        titulo: "Semana 3 · Operação",
        descricao:
          "Funcionário Digital entra em produção atendendo 24/7, com Painel Inteligente registrando cada conversa e o motivo de cada transferência.",
      },
      {
        titulo: "Semana 4 · Medição",
        descricao:
          "Revisar tempo de primeira resposta, taxa de resolução sem humano e conversas recuperadas fora do horário. Ajustar roteiro com o que aprendeu.",
      },
    ],
    dica:
      "Meça tempo de primeira resposta antes e depois — é a métrica que mais sensivelmente reflete dinheiro recuperado nesta trilha.",
  },
  sdr_vendas: {
    resumo:
      "Seu gargalo é transformar lead em reunião. O Funcionário Digital assume a primeira conversa, qualifica com método e entrega a reunião agendada — cada lead trabalhado, nenhum esfriando na fila.",
    semanas: [
      {
        titulo: "Semana 1 · Método",
        descricao:
          "Definir critérios de qualificação (perfil, dor, urgência, orçamento) e as perguntas de SPIN adaptadas ao seu negócio.",
      },
      {
        titulo: "Semana 2 · Fluxo",
        descricao:
          "Desenhar o fluxo de conversa do SDR digital: abertura, qualificação, objeções comuns, agendamento na agenda certa e handoff pro closer.",
      },
      {
        titulo: "Semana 3 · Operação",
        descricao:
          "Funcionário Digital entra em produção qualificando leads e agendando reuniões, com cada interação registrada no Painel Inteligente.",
      },
      {
        titulo: "Semana 4 · Medição",
        descricao:
          "Revisar contatos efetivos, reuniões agendadas e no-show. Ajustar perguntas e tom com base nas conversas reais da semana.",
      },
    ],
    dica:
      "Compare reuniões agendadas por lead antes e depois — é o número que prova (ou não) o valor do SDR digital no seu caso.",
  },
  operacao: {
    resumo:
      "Suas horas estão indo para trabalho repetitivo entre sistemas. O caminho é levantar os processos mais frequentes e automatizar de ponta a ponta — começando pelo que mais consome o time.",
    semanas: [
      {
        titulo: "Semana 1 · Levantamento",
        descricao:
          "Listar os 5 processos mais repetitivos (digitação, cópia entre sistemas, confirmações, cobranças, relatórios) e medir horas/mês de cada um.",
      },
      {
        titulo: "Semana 2 · Prioridade",
        descricao:
          "Escolher o processo nº1 por custo/hora e desenhar o fluxo que o Funcionário Digital vai executar, com regra clara de exceção pro humano.",
      },
      {
        titulo: "Semana 3 · Automação",
        descricao:
          "Construir e testar a automação com dados reais, integrando os sistemas envolvidos via API (ou planilha estruturada, se for o caso).",
      },
      {
        titulo: "Semana 4 · Medição",
        descricao:
          "Medir horas devolvidas ao time e taxa de erro antes/depois. Documentar o próximo processo da fila para escala.",
      },
    ],
    dica:
      "Registre as horas do processo nº1 durante uma semana antes de automatizar — sem baseline não existe prova de ganho.",
  },
  painel: {
    resumo:
      "Seu CRM vive desatualizado porque preencher CRM é trabalho que ninguém faz. O caminho é fazer a conversa virar dado sozinha — o funil se preenche enquanto o time trabalha.",
    semanas: [
      {
        titulo: "Semana 1 · Schema",
        descricao:
          "Definir quais campos importam no funil (origem, interesse, dor, etapa, próximo passo) e o que pode ser extraído da conversa.",
      },
      {
        titulo: "Semana 2 · Conexão",
        descricao:
          "Conectar canais e sistemas: cada conversa atendida pelo Funcionário Digital passa a alimentar o Painel Inteligente automaticamente.",
      },
      {
        titulo: "Semana 3 · Operação",
        descricao:
          "Painel entra em produção: conversa vira registro, registro vira estágio, estágio vira funil vivo — sem digitação manual.",
      },
      {
        titulo: "Semana 4 · Decisão",
        descricao:
          "Primeira reunião de pipeline usando dado vivo. Comparar decisões antes/depois e ajustar os campos que faltam.",
      },
    ],
    dica:
      "A métrica desta trilha é % de leads com próximo passo registrado — quando passa de 90%, o funil virou fonte de verdade.",
  },
  resgate: {
    resumo:
      "Sua frustração anterior foi com robô de script. O caminho agora é desenhar um piloto curto e mensurável, para provar na prática a diferença entre responder e executar.",
    semanas: [
      {
        titulo: "Semana 1 · Diagnóstico do passado",
        descricao:
          "Levantar onde o bot antigo travava (fora de roteiro, sem integração, sem memória) e definir o que 'funcionar' significa, em número.",
      },
      {
        titulo: "Semana 2 · Piloto delimitado",
        descricao:
          "Escolher um processo pontual e colocar o Funcionário Digital operando com integração real e regra de transferência clara.",
      },
      {
        titulo: "Semana 3 · Operação",
        descricao:
          "Piloto roda com casos reais: o Funcionário Digital sai do script, consulta dados e resolve — com Painel Inteligente auditando tudo.",
      },
      {
        titulo: "Semana 4 · Veredito",
        descricao:
          "Comparar resultado vs. meta definida na semana 1. Se bateu, escala pro segundo processo. Se não bateu, o painel mostra exatamente onde ajustar.",
      },
    ],
    dica:
      "Defina a meta do piloto antes de começar (ex.: 80% das conversas resolvidas sem humano) — é o que transforma 'achismo' em decisão.",
  },
};

// ------------------------------------------------------------
// Helpers de formato
// ------------------------------------------------------------
export function brl(n: number): string {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function num(n: number): string {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

/** rótulos legíveis para respostas (usado no payload e no plano LLM) */
export const LABELS: Record<string, Record<string, string>> = {
  dor_p1: {
    A: "demora/não responde leads",
    B: "não dá conta de qualificar e agendar",
    C: "horas em digitação/planilha/CRM",
    D: "funil invisível / CRM desatualizado",
    E: "já tentou bot e frustrou",
  },
  p3: {
    A: "sem resposta até o dia seguinte",
    B: "alguém responde quando dá",
    C: "resposta automática genérica",
    D: "atende na hora, quer vender melhor",
  },
  p4: { "1-2": "1–2 pessoas", "3-5": "3–5 pessoas", "6-15": "6–15 pessoas", "16+": "16+ pessoas" },
  p5: {
    A: "CRM/ERP com redigitação",
    B: "planilha e WhatsApp",
    C: "sistemas, integração incerta",
    D: "tudo integrado",
  },
  intencao_90d: {
    A: "parar de perder lead por demora",
    B: "agendar mais reuniões",
    C: "liberar time do repetitivo",
    D: "enxergar o funil",
    E: "provar que IA funciona",
  },
  porte: {
    autonomo: "autônomo/consultório",
    pequena: "pequena (até ~20)",
    media: "média (20–200)",
    grande: "grande (200+)",
    franquia: "franquia/rede",
  },
};

export function answersToSummary(answers: Answers): string {
  const parts: string[] = [];
  const p1 = (answers.dor_p1 as string) || "";
  if (LABELS.dor_p1[p1]) parts.push(`dor principal: ${LABELS.dor_p1[p1]}`);
  const canais = Array.isArray(answers.canais) ? answers.canais : [];
  if (canais.length) parts.push(`canais: ${canais.join(", ")}`);
  const p3 = (answers.p3 as string) || "";
  if (LABELS.p3[p3]) parts.push(`fora do horário: ${LABELS.p3[p3]}`);
  const p4 = (answers.p4 as string) || "";
  if (LABELS.p4[p4]) parts.push(`time operacional: ${LABELS.p4[p4]}`);
  const p5 = (answers.p5 as string) || "";
  if (LABELS.p5[p5]) parts.push(`sistemas: ${LABELS.p5[p5]}`);
  const p6 = (answers.intencao_90d as string) || "";
  if (LABELS.intencao_90d[p6]) parts.push(`meta 90d: ${LABELS.intencao_90d[p6]}`);
  const porte = (answers.porte as string) || "";
  if (LABELS.porte[porte]) parts.push(`porte: ${LABELS.porte[porte]}`);
  return parts.join(" · ");
}
