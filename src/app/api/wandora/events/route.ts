// ============================================================
// Wandora — POST /api/wandora/events
// Eventos de funil anônimos (start / restart), fire-and-forget.
// Rate limit em memória: máx. 30 eventos/minuto por IP.
// ============================================================

import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const bodySchema = z.object({
  type: z.enum(["start", "restart", "whatsapp_click"]),
  trailKey: z.string().optional(),
});

// ---------- rate limit simples em memória (global p/ HMR) ----------

interface RateBucket {
  count: number;
  resetAt: number;
}

const globalForRate = globalThis as unknown as {
  __wandoraEventRate?: Map<string, RateBucket>;
};

const rateBuckets: Map<string, RateBucket> =
  globalForRate.__wandoraEventRate ?? new Map<string, RateBucket>();
globalForRate.__wandoraEventRate = rateBuckets;

const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_MINUTE = 30;

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();

  // cleanup de janelas expiradas (map pequeno, varrer é barato)
  for (const [key, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(key);
  }

  const bucket = rateBuckets.get(ip);
  if (!bucket) {
    rateBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_EVENTS_PER_MINUTE) return false;
  bucket.count += 1;
  return true;
}

// ------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    if (!allowRequest(ip)) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde um instante e tente novamente." },
        { status: 429 }
      );
    }

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
        { error: "Tipo de evento inválido." },
        { status: 400 }
      );
    }

    await db.diagnosticEvent.create({
      data: {
        type: parsed.data.type,
        ...(parsed.data.trailKey ? { trailKey: parsed.data.trailKey } : {}),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[wandora/events]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
