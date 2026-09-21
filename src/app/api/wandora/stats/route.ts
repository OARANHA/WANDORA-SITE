// ============================================================
// Wandora — GET /api/wandora/stats
// Contagens anônimas do diagnóstico (prova social): total,
// últimos 7 dias e distribuição por trilha. NUNCA expõe dados
// de contato ou leads — apenas números agregados.
// Cache em memória de 30s para responder rápido.
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TRAILS, type TrailKey } from "@/lib/wandora/diagnostic";

export const dynamic = "force-dynamic";

interface TrailCount {
  key: TrailKey;
  label: string;
  count: number;
}

interface StatsPayload {
  total: number;
  week: number;
  trails: TrailCount[];
}

const CACHE_TTL_MS = 30_000;

interface StatsCache {
  at: number;
  data: StatsPayload;
}

// global p/ sobreviver ao hot-reload do dev
const globalForStats = globalThis as unknown as {
  __wandoraStatsCache?: StatsCache;
};

async function computeStats(): Promise<StatsPayload> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [total, week, grouped] = await Promise.all([
    db.diagnostic.count(),
    db.diagnostic.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    db.diagnostic.groupBy({
      by: ["trailKey"],
      _count: { _all: true },
    }),
  ]);

  const countsByKey = new Map(
    grouped.map((g) => [g.trailKey, g._count._all] as const)
  );

  // todas as 5 trilhas sempre presentes (0 quando ninguém escolheu),
  // ordenadas pela mais escolhida
  const trails: TrailCount[] = (Object.keys(TRAILS) as TrailKey[])
    .map((key) => ({
      key,
      label: TRAILS[key].label,
      count: countsByKey.get(key) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { total, week, trails };
}

export async function GET() {
  try {
    const cached = globalForStats.__wandoraStatsCache;
    const fresh = cached && Date.now() - cached.at < CACHE_TTL_MS;

    const data = fresh ? cached.data : await computeStats();
    if (!fresh) {
      globalForStats.__wandoraStatsCache = { at: Date.now(), data };
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[wandora/stats]", error);
    return NextResponse.json(
      { error: "Erro interno. Tente novamente em instantes." },
      { status: 500 }
    );
  }
}
