"use client";

import { useMemo, useState } from "react";
import {
  TRAILS,
  roiDefaultsFrom,
  type Answers,
  type ComputedResult,
} from "@/lib/wandora/diagnostic";
import { WANDORA } from "@/lib/wandora/config";
import { RoiCalculator } from "./roi-calculator";
import { ComparisonSection } from "./comparison-matrix";
import { Plan30d } from "./plan-30d";
import { LeadForm } from "./lead-form";
import { Crosshair, ListChecks, Zap } from "lucide-react";

export function ScreenResult({
  result,
  answers,
  diagnosticId,
  onRestart,
  resultRef,
}: {
  result: ComputedResult;
  answers: Answers;
  diagnosticId: string | null;
  onRestart: () => void;
  resultRef: React.RefObject<HTMLDivElement | null>;
}) {
  const trail = TRAILS[result.trailKey];
  const [waBase] = useState(
    () =>
      `https://wa.me/${WANDORA.whatsapp}?text=${encodeURIComponent(trail.waText)}`
  );

  const roiDefaults = useMemo(
    () => roiDefaultsFrom(answers, result.trailKey),
    [answers, result.trailKey]
  );

  return (
    <div ref={resultRef} className="result-root" aria-label="Resultado do diagnóstico">
      <span className="result-eyebrow">
        <Crosshair className="h-3.5 w-3.5" aria-hidden="true" />
        Sua trilha · {trail.label}
      </span>

      <div className="result-verdict">
        <h2 className="glitch" dangerouslySetInnerHTML={{ __html: trail.verdict }} />
        <p className="why" dangerouslySetInnerHTML={{ __html: trail.why }} />
      </div>

      <div className="result-block">
        <p className="r-lab">
          <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
          O que o Funcionário Digital executa
        </p>
        <p>
          <strong>Ele executa:</strong> {trail.exec}
        </p>
      </div>

      <div className="result-urgency" aria-label="Leitura de urgência">
        <p className="r-lab" style={{ background: "var(--acid)", color: "var(--ink)" }}>
          Sua urgência: {result.urgencyLvl === "alta" ? "ALTA — aja esta semana" : result.urgencyLvl === "media" ? "MÉDIA — planeje este mês" : "BAIXA — comece a escalar"}
        </p>
        <p dangerouslySetInnerHTML={{ __html: result.urgencyText }} />
      </div>

      <RoiCalculator defaults={roiDefaults} />

      <ComparisonSection />

      <Plan30d trailKey={result.trailKey} answers={answers} />

      <div className="result-block" aria-label="Prova com dado de mercado">
        <p className="r-lab">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          Por que essa trilha primeiro
        </p>
        <p dangerouslySetInnerHTML={{ __html: trail.proof }} />
      </div>

      <LeadForm diagnosticId={diagnosticId} waHref={waBase} trailKey={result.trailKey} />

      <p className="result-closing">
        Em 5 anos não haverá empresa saudável sem Funcionários Digitais. A sua
        começa pelo diagnóstico — e{" "}
        <strong>você já deu o primeiro passo</strong>.
      </p>

      <button type="button" className="result-restart" onClick={onRestart}>
        ↺ Refazer o diagnóstico
      </button>
    </div>
  );
}
