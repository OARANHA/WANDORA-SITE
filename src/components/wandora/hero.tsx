"use client";

import { ArrowRight, Check } from "lucide-react";

export function Hero({
  diagnosticsDone,
}: {
  diagnosticsDone: number;
}) {
  return (
    <header className="hero shell" id="topo">
      <div className="hero-grid">
        <div className="hero-copy">
          <span className="hero-sticker" aria-hidden="true">
            ★ Funcionários Digitais · Sem CLT
          </span>

          <h1 className="hero-display">
            <span className="line glitch">Seu próximo</span>
            <span className="line glitch outline-word">funcionário</span>
            <span className="line glitch">
              não tem{" "}
              <span className="cpf-box">CPF</span>
              <span className="cpf-dot">.</span>
            </span>
          </h1>

          <p className="hero-lede">
            A Wandora é a <span className="mark">camada operacional</span> da
            sua empresa: contrate, treine, gerencie e avalie funcionários
            digitais lado a lado com o seu time humano.{" "}
            <strong>Uma equipe só, um painel só, zero jargão.</strong>
          </p>

          <div className="hero-ctas">
            <a href="#diagnostico" className="btn-hard">
              Descobrir quem contratar
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
            <a href="#equipe" className="btn-paper">
              Conheça a equipe
            </a>
          </div>

          <div className="hero-trust" aria-label="Garantias">
            <span>
              <Check className="h-4 w-4" aria-hidden="true" />
              Diagnóstico grátis
            </span>
            <span>
              <Check className="h-4 w-4" aria-hidden="true" />
              Resultado na hora
            </span>
            <span>
              <Check className="h-4 w-4" aria-hidden="true" />
              Sem compromisso
            </span>
            {diagnosticsDone > 0 && (
              <span>
                <Check className="h-4 w-4" aria-hidden="true" />
                {diagnosticsDone} diagnósticos feitos
              </span>
            )}
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-img-card">
            <img
              src="/wandora/equipe-mista.webp"
              alt=""
              draggable={false}
            />
          </div>

          <div className="hero-stat-chip floaty" style={{ animationDelay: "0.2s" }}>
            <b>7×</b> mais chance de vender respondendo em 5 min
          </div>

          <div className="hero-meta-card floaty" style={{ animationDelay: "1.1s" }}>
            <div className="hero-meta-head">
              <span className="hero-meta-ava">FD</span>
              <div>
                <b>Funcionários Digitais</b>
                <span>Meta batida · 14/14 orçamentos hoje</span>
              </div>
              <span className="hero-meta-pct">100%</span>
            </div>
            <div
              className="hero-meta-bar"
              role="img"
              aria-label="Progresso da meta diária: 14 de 14 orçamentos, 100%"
            >
              <i style={{ width: "100%" }} />
            </div>
          </div>

          <div className="hero-float-card floaty" style={{ animationDelay: "0.6s" }}>
            <span className="hero-float-dot" />
            <div>
              <b>24/7 no ar</b>
              <span>sem folha extra</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
