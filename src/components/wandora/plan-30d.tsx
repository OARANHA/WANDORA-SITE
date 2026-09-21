"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_PLANS,
  type Plan,
  type TrailKey,
} from "@/lib/wandora/diagnostic";
import { API } from "@/lib/wandora/config";
import { Route, Sparkles } from "lucide-react";

export function Plan30d({
  trailKey,
  answers,
}: {
  trailKey: TrailKey;
  answers: Record<string, unknown>;
}) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(API.plan, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trailKey, answers }),
        });
        if (!res.ok) throw new Error("plan api");
        const data = await res.json();
        if (alive && data?.plan) {
          setPlan(data.plan as Plan);
          setPersonalized(Boolean(data.personalized));
        }
      } catch {
        if (alive) setPlan(FALLBACK_PLANS[trailKey]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [trailKey, answers]);

  return (
    <div className="plan" id="plano">
      <p className="r-lab">
        <Route className="h-3.5 w-3.5" aria-hidden="true" />
        Seus primeiros 30 dias
        {personalized && (
          <span
            style={{
              background: "var(--acid)",
              color: "var(--ink)",
              border: "2px solid var(--acid)",
              borderRadius: 999,
              padding: "1px 10px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            gerado pra você
          </span>
        )}
      </p>

      {loading ? (
        <div>
          <p className="plan-resumo">
            Estamos cruzando suas respostas com a metodologia da Wandora pra
            montar o plano…
          </p>
          <p className="plan-loading" role="status" aria-live="polite">
            <span className="plan-dot" /> <span className="plan-dot" />{" "}
            <span className="plan-dot" /> gerando seu roteiro de 4 semanas
          </p>
        </div>
      ) : (
        plan && (
          <>
            <p className="plan-resumo">{plan.resumo}</p>
            <div className="plan-weeks">
              {plan.semanas.map((s, i) => (
                <div className="plan-week" key={i}>
                  <span className="n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <b>{s.titulo}</b>
                    <p>{s.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="plan-dica">
              <b>Dica de métrica:</b>
              {plan.dica}
            </p>
          </>
        )
      )}
    </div>
  );
}
