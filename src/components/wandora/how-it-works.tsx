"use client";

import { ClipboardList, Cpu, TrendingUp } from "lucide-react";

const STEPS = [
  {
    n: "01",
    icon: ClipboardList,
    title: "Responda 7 perguntas",
    desc: "Sobre a sua dor nº1, canais, horário de atendimento, time, sistemas e meta dos próximos 90 dias. Sem login, ~90 segundos.",
  },
  {
    n: "02",
    icon: Cpu,
    title: "Receba a trilha na hora",
    desc: "O cruzamento das respostas aponta o processo que está vazando dinheiro hoje — e qual Funcionário Digital executa esse processo de ponta a ponta.",
  },
  {
    n: "03",
    icon: TrendingUp,
    title: "Estime o retorno e o plano",
    desc: "Ajuste o estimador de ROI com seus números, veja o plano dos primeiros 30 dias e, se quiser, leve tudo pro WhatsApp da Wandora.",
  },
];

export function HowItWorks() {
  return (
    <div className="steps" id="como-funciona">
      {STEPS.map((s) => (
        <div className="step" key={s.n}>
          <span className="n" aria-hidden="true">
            {s.n}
          </span>
          <b>
            <s.icon className="h-5 w-5" aria-hidden="true" />
            {s.title}
          </b>
          <p>{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
