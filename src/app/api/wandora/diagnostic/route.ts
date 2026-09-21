// ============================================================
// Wandora — POST /api/wandora/diagnostic
// Recebe as 7 respostas do quiz, computa o resultado com o
// motor (server-side), persiste o Diagnóstico + evento
// "complete" e devolve `{ id, result }`.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { computeResult, type Answers } from "@/lib/wandora/diagnostic";

// as 7 chaves esperadas — `canais` é multi (array), resto string
const answersSchema = z.object({
  dor_p1: z.string().min(1),
  canais: z.array(z.string().min(1)).min(1),
  p3: z.string().min(1),
  p4: z.string().min(1),
  p5: z.string().min(1),
  intencao_90d: z.string().min(1),
  porte: z.string().min(1),
});

const bodySchema = z.object({
  answers: answersSchema,
});

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
        {
          error:
            "Respostas incompletas ou inválidas. Refaça o diagnóstico respondendo todas as perguntas.",
        },
        { status: 400 }
      );
    }

    const answers: Answers = parsed.data.answers;

    // resultado computado server-side (fonte de verdade)
    const result = computeResult(answers);

    const diagnostic = await db.diagnostic.create({
      data: {
        trailKey: result.trailKey,
        trailLabel: result.trailLabel,
        answers: JSON.stringify(answers),
        urgencyScore: result.urgency,
        urgencyLevel: result.urgencyLvl,
        fitScore: result.fit,
        events: {
          create: {
            type: "complete",
            trailKey: result.trailKey,
          },
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ id: diagnostic.id, result });
  } catch (error) {
    console.error("[wandora/diagnostic]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
