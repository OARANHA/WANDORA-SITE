"use client";

import { useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface Employee {
  name: string;
  role: string;
  img: string;
  badge?: string;
  badgeHi?: boolean;
  skills: string[];
}

const EMPLOYEES: Employee[] = [
  {
    name: "Aurora",
    role: "Atendimento 24/7",
    img: "/wandora/emp-atendimento.png",
    badge: "Mais contratada",
    badgeHi: true,
    skills: [
      "Responde toda mensagem na hora",
      "Fala com a voz da sua marca",
      "Transfere pro humano certo",
    ],
  },
  {
    name: "Vega",
    role: "SDR / Vendas",
    img: "/wandora/emp-sdr.png",
    skills: [
      "Qualifica leads com método",
      "Agenda reunião na agenda certa",
      "Follow-up sem deixar esfriar",
    ],
  },
  {
    name: "Noé",
    role: "Operação & Backoffice",
    img: "/wandora/emp-operacao.png",
    skills: [
      "Move dados entre sistemas",
      "Cobra, confirma e lembra",
      "Sem erro e sem cansar",
    ],
  },
  {
    name: "Íris",
    role: "Painel / Dados",
    img: "/wandora/emp-painel.png",
    skills: [
      "Funil que se preenche sozinho",
      "Relatórios prontos, sem digitar",
      "Decisão com dado vivo",
    ],
  },
  {
    name: "Fênix",
    role: "Resgate (já tentei bot)",
    img: "/wandora/emp-resgate.png",
    skills: [
      "Pra quem já se frustrou com bot",
      "Sai do script, resolve o caso",
      "Aprende com cada conversa",
    ],
  },
];

export function Team() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }, []);

  return (
    <section className="team shell" id="equipe" aria-label="Equipe de funcionários digitais">
      <div className="team-head">
        <div>
          <span className="kicker">Contratações disponíveis</span>
          <h2 className="sec-title" style={{ marginBottom: 0 }}>
            A <span className="glitch">equipe</span> pronta
          </h2>
        </div>
        <div className="team-arrows">
          <button
            type="button"
            className="team-arrow"
            aria-label="Ver funcionários anteriores"
            onClick={() => scrollBy(-1)}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="team-arrow"
            aria-label="Ver próximos funcionários"
            onClick={() => scrollBy(1)}
          >
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="team-scroll" ref={scrollRef} role="list">
        {EMPLOYEES.map((e) => (
          <article className="emp-card" role="listitem" key={e.name}>
            <div className="emp-img">
              <img src={e.img} alt={`Funcionário digital ${e.name} — ${e.role}`} draggable={false} />
              {e.badge && (
                <span className={`emp-badge${e.badgeHi ? " hi" : ""}`}>{e.badge}</span>
              )}
            </div>
            <div className="emp-body">
              <span className="emp-role">{e.role}</span>
              <h3 className="emp-name">{e.name}</h3>
              <ul className="emp-list">
                {e.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <a className="emp-cta" href="#diagnostico">
                Contratar a {e.name} →
              </a>
            </div>
          </article>
        ))}

        {/* card sob medida */}
        <article className="emp-card custom" role="listitem">
          <div className="emp-img" style={{ background: "var(--paper)" }}>
            <img
              src="/wandora/bento-abstract.png"
              alt=""
              draggable={false}
              style={{ opacity: 0.9 }}
            />
            <span className="emp-badge">Sob encomenda</span>
          </div>
          <div className="emp-body">
            <span className="emp-role">Sob medida</span>
            <h3 className="emp-name">O seu</h3>
            <ul className="emp-list">
              <li>Financeiro, logística, agendamento…</li>
              <li>Desenhamos pro seu processo</li>
              <li>Se tem regra, vira funcionário</li>
            </ul>
            <a className="emp-cta" href="#diagnostico">
              Descrever meu caso →
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
