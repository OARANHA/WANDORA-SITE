import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const ALLOWED_ORIGINS = new Set([
  "https://vigia.wandora.com.br",
  "https://app-vigia.wandora.com.br",
]);

const schema = z.object({
  product: z.literal("vigia"),
  source: z.enum(["vigia-landing", "vigia-login"]),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  whatsapp: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().min(2).max(160),
  website: z.string().trim().max(300).optional().default(""),
  useCase: z.enum(["atendimento", "vendas", "agendamento", "operacoes", "outro"]),
  agentsCount: z.enum(["1", "2-5", "6-20", "20+", "ainda-nao-tenho"]).optional(),
  stack: z.string().trim().max(200).optional().default(""),
  successDefinition: z.string().trim().max(500).optional().default(""),
  message: z.string().trim().max(1500).optional().default(""),
  consent: z.literal(true),
});

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  return origin && ALLOWED_ORIGINS.has(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : {};
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders(request),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });
  }

  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Revise os dados do formulário e tente novamente." },
        { status: 400, headers: corsHeaders(request) }
      );
    }

    const data = parsed.data;
    const interest = await db.productInterest.create({
      data: {
        product: data.product,
        source: data.source,
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp || null,
        company: data.company,
        website: data.website || null,
        useCase: data.useCase,
        agentsCount: data.agentsCount ?? null,
        stack: data.stack || null,
        successDefinition: data.successDefinition || null,
        message: data.message || null,
        consentContact: true,
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        success: true,
        interestId: interest.id,
        message: "Recebemos seu interesse. A equipe Wandora vai entrar em contato para entender seu cenário e apresentar o Vigia.",
      },
      { status: 201, headers: corsHeaders(request) }
    );
  } catch (error) {
    console.error("[wandora/product-interest]", error);
    return NextResponse.json(
      { error: "Não foi possível registrar seu interesse agora. Tente novamente em instantes." },
      { status: 500, headers: corsHeaders(request) }
    );
  }
}
