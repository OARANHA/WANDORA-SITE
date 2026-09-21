// ============================================================
// Wandora — POST /api/wandora/plan
// Plano de 30 dias personalizado com LLM para a trilha
// recomendada. Timeout de 20s; shape inválido/erro →
// FALLBACK_PLANS determinístico do motor.
// Retorna `{ plan, personalized }`.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import {
  TRAILS,
  FALLBACK_PLANS,
  answersToSummary,
  type TrailKey,
  type Plan,
  type PlanWeek,
  type Answers,
} from "@/lib/wandora/diagnostic";
import { llmChat, extractJSON, type LlmMessage } from "@/lib/wandora/zai";
import { WANDORA } from "@/lib/wandora/config";

const LLM_TIMEOUT_MS = 20_000;

// as 5 trilhas válidas, derivadas do motor (fonte única de verdade)
const WANDORA_TRAIL_KEYS = Object.keys(TRAILS) as [TrailKey, ...TrailKey[]];

const bodySchema = z.object({
  trailKey: z.enum(WANDORA_TRAIL_KEYS),
  answers: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .default({}),
});

/** padroniza "Semana N · tema" (renumera pelo índice, separador "·") */
function standardizeWeekTitle(index: number, titulo: string): string {
  const weekNum = index + 1;
  const t = titulo.trim().replace(/\s+/g, " ");
  const stripped = t.replace(/^Semana\s*\d+\s*[:·\-–—]?\s*/i, "");
  return stripped ? `Semana ${weekNum} · ${stripped}` : `Semana ${weekNum}`;
}

/** valida e repara minimamente o JSON do LLM → Plan ou null */
function toPlan(candidate: unknown): Plan | null {
  if (!candidate || typeof candidate !== "object") return null;
  const obj = candidate as Record<string, unknown>;

  const resumo = typeof obj.resumo === "string" ? obj.resumo.trim() : "";
  const dica = typeof obj.dica === "string" ? obj.dica.trim() : "";
  const semanasRaw = Array.isArray(obj.semanas) ? obj.semanas : [];

  if (!resumo || !dica || semanasRaw.length !== 4) return null;

  const semanas: PlanWeek[] = [];
  for (let i = 0; i < 4; i++) {
    const w = semanasRaw[i];
    if (!w || typeof w !== "object") return null;
    const wo = w as Record<string, unknown>;
    const titulo = typeof wo.titulo === "string" ? wo.titulo.trim() : "";
    const descricao = typeof wo.descricao === "string" ? wo.descricao.trim() : "";
    if (!titulo || !descricao) return null;
    semanas.push({ titulo: standardizeWeekTitle(i, titulo), descricao });
  }

  return { resumo, semanas, dica };
}

export async function POST(request: Request) {
  try {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corpo da requisição inválido." },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Trilha inválida. Escolha uma das 5 trilhas do diagnóstico." },
        { status: 400 }
      );
    }

    const trailKey: TrailKey = parsed.data.trailKey;
    const trail = TRAILS[trailKey];
    const answers = parsed.data.answers as Answers;

    const messages: LlmMessage[] = [
      {
        role: "system",
        content: `Você é ${WANDORA.assistantName}, funcionária digital da Wandora — empresa que cria Funcionários Digitais com IA: agentes que atendem, vendem, qualificam e operam processos de ponta a ponta, 24 horas por dia. Você escreve planos de implantação curtos, concretos e verificáveis.`,
      },
      {
        role: "user",
        content: `Um cliente acabou de completar o Diagnóstico de IA da Wandora e recebeu a trilha recomendada. Escreva o plano de 30 dias personalizado para este cliente começar a implantar IA por esta trilha.

Contexto do cliente:
- Trilha recomendada: ${trail.label}
- O que o Funcionário Digital executa nesta trilha: ${trail.exec}
- Resumo das respostas do diagnóstico: ${answersToSummary(answers)}

Regras do plano:
- Exatamente 4 semanas, em sequência lógica (desenho → conexão → operação → medição, adaptado à trilha).
- Cada "descricao" deve ter 1-2 frases com ação concreta e verificável — nada genérico.
- "resumo": 2-3 frases personalizadas explicando por que esta trilha é o ponto de partida para este cliente.
- "dica": 1 dica de métrica ou de primeiro passo.
- Português do Brasil, tom consultivo e direto, sem promessas exageradas.
- Não cite concorrentes nem outras empresas.
- Mencione "Funcionário Digital" e "Wandora" onde for natural, sem forçar.

Responda APENAS com JSON válido, sem markdown e sem comentários, exatamente neste formato:
{
  "resumo": "2-3 frases personalizadas por que esta trilha é o ponto de partida",
  "semanas": [
    { "titulo": "Semana 1 · <tema curto>", "descricao": "1-2 frases concretas" },
    { "titulo": "Semana 2 · <tema curto>", "descricao": "1-2 frases concretas" },
    { "titulo": "Semana 3 · <tema curto>", "descricao": "1-2 frases concretas" },
    { "titulo": "Semana 4 · <tema curto>", "descricao": "1-2 frases concretas" }
  ],
  "dica": "1 dica de métrica/primeiro passo"
}`,
      },
    ];

    const llmRaw = await llmChat(messages, LLM_TIMEOUT_MS);
    const llmPlan = llmRaw ? toPlan(extractJSON<unknown>(llmRaw)) : null;

    if (llmPlan) {
      return NextResponse.json({ plan: llmPlan, personalized: true });
    }

    // fallback determinístico do motor
    return NextResponse.json({
      plan: FALLBACK_PLANS[trailKey],
      personalized: false,
    });
  } catch (error) {
    console.error("[wandora/plan]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
