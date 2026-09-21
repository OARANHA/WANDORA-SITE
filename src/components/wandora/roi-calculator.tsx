"use client";

import { useMemo, useState } from "react";
import {
  computeRoi,
  brl,
  num,
  type RoiInputs,
} from "@/lib/wandora/diagnostic";
import { Calculator } from "lucide-react";

export function RoiCalculator({ defaults }: { defaults: RoiInputs }) {
  const [leadsMes, setLeadsMes] = useState(defaults.leadsMes);
  const [ticketMedio, setTicketMedio] = useState(defaults.ticketMedio);
  const [pctForaHorario, setPctForaHorario] = useState(defaults.pctForaHorario);
  const [horasRepetitivas, setHorasRepetitivas] = useState(
    defaults.horasRepetitivas
  );

  const out = useMemo(
    () =>
      computeRoi({
        leadsMes,
        ticketMedio,
        pctForaHorario,
        horasRepetitivas,
      }),
    [leadsMes, ticketMedio, pctForaHorario, horasRepetitivas]
  );

  return (
    <div className="roi" id="roi">
      <div className="roi-head">
        <p className="r-lab">
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          Estimador de retorno — ajuste com os seus números
        </p>
        <p>
          Movimente os controles e veja, na hora, o que um Funcionário
          Digital pode devolver por mês. Os valores iniciais já vêm das{" "}
          <strong>suas respostas</strong>.
        </p>
      </div>

      <div className="roi-grid">
        <div>
          <div className="roi-field">
            <label htmlFor="roi-leads">
              Conversas/leads por mês <b>{num(leadsMes)}</b>
            </label>
            <input
              id="roi-leads"
              type="range"
              className="roi-range"
              min={20}
              max={3000}
              step={10}
              value={leadsMes}
              onChange={(e) => setLeadsMes(Number(e.target.value))}
            />
          </div>
          <div className="roi-field">
            <label htmlFor="roi-ticket">
              Ticket médio <b>{brl(ticketMedio)}</b>
            </label>
            <input
              id="roi-ticket"
              type="range"
              className="roi-range"
              min={100}
              max={20000}
              step={50}
              value={ticketMedio}
              onChange={(e) => setTicketMedio(Number(e.target.value))}
            />
          </div>
          <div className="roi-field">
            <label htmlFor="roi-fora">
              Chega fora do horário <b>{pctForaHorario}%</b>
            </label>
            <input
              id="roi-fora"
              type="range"
              className="roi-range"
              min={0}
              max={80}
              step={5}
              value={pctForaHorario}
              onChange={(e) => setPctForaHorario(Number(e.target.value))}
            />
          </div>
          <div className="roi-field">
            <label htmlFor="roi-horas">
              Horas/mês em tarefas repetitivas <b>{num(horasRepetitivas)}h</b>
            </label>
            <input
              id="roi-horas"
              type="range"
              className="roi-range"
              min={10}
              max={1200}
              step={10}
              value={horasRepetitivas}
              onChange={(e) => setHorasRepetitivas(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="roi-out">
          <div className="roi-card">
            <b>{num(out.conversasRecuperadas)}</b>
            <span>conversas recuperadas por mês (fora do horário)</span>
          </div>
          <div className="roi-card">
            <b>{num(out.horasLiberadas)}h</b>
            <span>horas do time liberadas por mês</span>
          </div>
          <div className="roi-card">
            <b>{brl(out.receitaRecuperada)}</b>
            <span>receita recuperada por mês (estimativa conservadora)</span>
          </div>
          <div className="roi-card">
            <b>{brl(out.ganhoTotal)}</b>
            <span>ganho total estimado por mês (receita + custo evitado)</span>
          </div>
        </div>
      </div>

      <p className="roi-note">
        Estimativa educativa da metodologia de ROI para Funcionários
        Digitais (recuperação de conversas fora do horário + horas
        devolvidas ao time). Payback estimado:{" "}
        <strong>
          {Number.isFinite(out.paybackDias) ? `${out.paybackDias} dias` : "—"}
        </strong>{" "}
        · Retorno em 12 meses:{" "}
        <strong>{out.roi12m.toFixed(1)}×</strong>. Os números reais dependem
        do seu processo — é isso que o time Wandora desenha com você.
      </p>
    </div>
  );
}
