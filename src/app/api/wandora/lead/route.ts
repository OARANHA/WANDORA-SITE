// ============================================================
// Wandora — POST /api/wandora/lead
// Captura de contato pós-diagnóstico (com consentimento LGPD).
// Atualiza o Diagnóstico, registra o evento "lead_captured" e
// gera o enriquecimento do Painel Inteligente com LLM
// (resumo/prioridade/próximo passo para o time comercial).
// O resumo do LLM NUNCA é devolvido ao cliente — é interno.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { answersToSummary, type Answers } from "@/lib/wandora/diagnostic";
import { llmChat, extractJSON, type LlmMessage } from "@/lib/wandora/zai";

const WHATSAPP_REGEX = /^\+?\d{10,15}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LLM_TIMEOUT_MS = 20_000;

const bodySchema = z.object({
  diagnosticId: z.string().min(1),
  contact: z
    .object({
      name: z.string().optional(),
      company: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().optional(),
    })
    .default({}),
  consent: z.boolean(),
});

/** normaliza WhatsApp: mantém apenas dígitos e o "+" inicial */
function normalizeWhatsapp(value: string): string {
  return value.replace(/[^\d+]/g, "");
}

/** aceita "alta"/"Alta"/"média"/"high"... → chave canônica ou null */
function normalizePriority(value: unknown): "alta" | "media" | "baixa" | null {
  if (typeof value !== "string") return null;
  const p = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (p === "alta" || p === "high") return "alta";
  if (p === "media" || p === "medio" || p === "medium") return "media";
  if (p === "baixa" || p === "low") return "baixa";
  return null;
}

interface Enrichment {
  aiSummary: string;
  aiPriority: "alta" | "media" | "baixa";
  aiNextStep: string;
}

/** próximo passo fixo por prioridade (fallback determinístico) */
const NEXT_STEP_BY_PRIORITY: Record<"alta" | "media" | "baixa", string> = {
  alta: "Chamar ainda hoje: dor ativa e perfil aderente. Propor uma conversa de diagnóstico de 15 minutos ainda esta semana.",
  media:
    "Contactar via WhatsApp em até 24h, retomar a dor apontada no diagnóstico e propor um agendamento para os próximos dias.",
  baixa:
    "Enviar o material da trilha recomendada e retomar o contato em cerca de 7 dias — nutrir até a urgência amadurecer.",
};

function fallbackEnrichment(
  trailLabel: string,
  answers: Answers,
  urgencyLvl: string
): Enrichment {
  const priority =
    urgencyLvl === "alta" || urgencyLvl === "media" || urgencyLvl === "baixa"
      ? urgencyLvl
      : "media";
  return {
    aiSummary: `Lead da trilha ${trailLabel}: ${answersToSummary(answers)}`,
    aiPriority: priority,
    aiNextStep: NEXT_STEP_BY_PRIORITY[priority],
  };
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
        { error: "Dados de contato inválidos." },
        { status: 400 }
      );
    }

    const { diagnosticId, consent } = parsed.data;

    if (consent !== true) {
      return NextResponse.json(
        { error: "É necessário aceitar o contato para enviar." },
        { status: 400 }
      );
    }

    // normaliza: trim em tudo, vira null quando vazio
    const name = parsed.data.contact.name?.trim() || null;
    const company = parsed.data.contact.company?.trim() || null;
    const whatsappRaw = parsed.data.contact.whatsapp?.trim() || "";
    const email = parsed.data.contact.email?.trim() || "";

    if (!whatsappRaw && !email) {
      return NextResponse.json(
        { error: "Informe pelo menos um contato: WhatsApp ou e-mail." },
        { status: 400 }
      );
    }

    let whatsapp: string | null = null;
    if (whatsappRaw) {
      whatsapp = normalizeWhatsapp(whatsappRaw);
      if (!WHATSAPP_REGEX.test(whatsapp)) {
        return NextResponse.json(
          {
            error:
              "WhatsApp inválido. Use o formato com DDD (ex.: 11999999999).",
          },
          { status: 400 }
        );
      }
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "E-mail inválido. Confira e tente novamente." },
        { status: 400 }
      );
    }

    const diagnostic = await db.diagnostic.findUnique({
      where: { id: diagnosticId },
    });
    if (!diagnostic) {
      return NextResponse.json(
        { error: "Diagnóstico não encontrado." },
        { status: 404 }
      );
    }

    // 1) persiste o contato + evento de funil
    await db.diagnostic.update({
      where: { id: diagnostic.id },
      data: {
        contactName: name,
        contactCompany: company,
        contactWhatsapp: whatsapp,
        contactEmail: email || null,
        consentContact: true,
        leadStatus: "capturado",
        events: {
          create: {
            type: "lead_captured",
            trailKey: diagnostic.trailKey,
          },
        },
      },
    });

    // 2) enriquecimento do Painel Inteligente (LLM com fallback)
    let answers: Answers = {};
    try {
      answers = JSON.parse(diagnostic.answers) as Answers;
    } catch {
      answers = {};
    }

    const contactBits: string[] = [];
    if (name) contactBits.push(`nome: ${name}`);
    if (company) contactBits.push(`empresa: ${company}`);
    if (whatsapp) contactBits.push(`WhatsApp: ${whatsapp}`);
    if (email) contactBits.push(`e-mail: ${email}`);
    const contactLine = contactBits.join(" · ");

    const messages: LlmMessage[] = [
      {
        role: "system",
        content:
          "Você é o assistente interno de pré-vendas da Wandora, empresa de Funcionários Digitais com IA. Escreve notas internas curtas e diretas para o time comercial — sem marketing, sem elogios vazios, foco em informação útil para vender.",
      },
      {
        role: "user",
        content: `Um lead acabou de pedir contato depois de completar o Diagnóstico de IA da Wandora. Gere a nota interna de pré-vendas.

Contexto do lead:
- Trilha recomendada: ${diagnostic.trailLabel}
- Resumo do diagnóstico: ${answersToSummary(answers)}
- Nível de urgência: ${diagnostic.urgencyLevel} (score ${diagnostic.urgencyScore})
- Fit comercial estimado: ${diagnostic.fitScore}/100
- Contato: ${contactLine}

Regras:
- "aiSummary": 2 a 3 frases sobre o lead — dor principal, contexto e por que a trilha recomendada faz sentido. Tom interno e direto.
- "aiPriority": "alta", "media" ou "baixa" — combine o nível de urgência com o fit comercial.
- "aiNextStep": próximo passo recomendado para o vendedor humano (1 a 2 frases, ação concreta).

Responda APENAS com JSON válido, sem markdown e sem comentários, exatamente neste formato:
{ "aiSummary": "...", "aiPriority": "alta" | "media" | "baixa", "aiNextStep": "..." }`,
      },
    ];

    const llmRaw = await llmChat(messages, LLM_TIMEOUT_MS);
    const llmJson = llmRaw ? extractJSON<unknown>(llmRaw) : null;

    let enrichment: Enrichment | null = null;
    if (llmJson && typeof llmJson === "object") {
      const obj = llmJson as Record<string, unknown>;
      const summary =
        typeof obj.aiSummary === "string" ? obj.aiSummary.trim() : "";
      const nextStep =
        typeof obj.aiNextStep === "string" ? obj.aiNextStep.trim() : "";
      const priority = normalizePriority(obj.aiPriority);
      if (summary && nextStep && priority) {
        enrichment = {
          aiSummary: summary,
          aiPriority: priority,
          aiNextStep: nextStep,
        };
      }
    }

    if (!enrichment) {
      enrichment = fallbackEnrichment(
        diagnostic.trailLabel,
        answers,
        diagnostic.urgencyLevel
      );
    }

    await db.diagnostic.update({
      where: { id: diagnostic.id },
      data: {
        aiSummary: enrichment.aiSummary,
        aiPriority: enrichment.aiPriority,
        aiNextStep: enrichment.aiNextStep,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Pronto! Recebemos seu contato. A equipe da Wandora vai analisar seu diagnóstico e retornar em breve — normalmente em até 1 dia útil.",
    });
  } catch (error) {
    console.error("[wandora/lead]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
