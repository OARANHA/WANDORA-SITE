"use client";

import { Check, Play } from "lucide-react";

export interface Stats {
  total: number;
  week: number;
  trails: { key: string; label: string; count: number }[];
}

export function ScreenOpening({
  onStart,
  stats,
}: {
  onStart: () => void;
  stats: Stats | null;
}) {
  return (
    <div aria-label="Abertura do diagnóstico">
      <span className="kicker">Diagnóstico gratuito · 7 perguntas · ~90 segundos</span>

      <h2 className="diag-open-title">
        <span className="glitch">Qual funcionário digital</span>{" "}
        <span className="glitch">a sua empresa</span>{" "}
        <span style={{ background: "var(--acid)", border: "3px solid var(--ink)", borderRadius: "14px", padding: "0 0.14em", display: "inline-block", boxShadow: "var(--hs)" }}>
          deve contratar?
        </span>
      </h2>

      <p className="diag-open-lede">
        A resposta não é “compre uma ferramenta”. É descobrir qual processo
        está <strong>vazando dinheiro hoje</strong> — e colocar um{" "}
        <strong>Funcionário Digital</strong> pra{" "}
        <strong>executar esse processo de ponta a ponta</strong>. Responda 7
        perguntas e receba o ponto de partida com o maior retorno pro seu
        caso.
      </p>

      <button className="btn-hard" onClick={onStart}>
        <Play className="h-5 w-5" aria-hidden="true" />
        Começar o diagnóstico →
      </button>

      {stats && stats.total > 0 && (
        <p className="diag-micro-trust">
          <Check className="h-4 w-4" aria-hidden="true" />
          <span>
            <strong>{stats.total}</strong> diagnósticos já realizados por
            aqui — {stats.week} só nos últimos 7 dias. Resultado na hora,
            sem cadastro.
          </span>
        </p>
      )}

      <div className="diag-open-grid" role="list" aria-label="Como o diagnóstico funciona">
        <div className="diag-opg" role="listitem">
          <b>Sem login</b>
          <span>Pergunta a pergunta, leva ~90 segundos.</span>
        </div>
        <div className="diag-opg" role="listitem">
          <b>Resposta na hora</b>
          <span>O resultado aparece assim que você termina.</span>
        </div>
        <div className="diag-opg" role="listitem">
          <b>Sem compromisso</b>
          <span>Contato é opcional, só no fim.</span>
        </div>
      </div>

      {stats && stats.total > 2 && (
        <div className="diag-stats" aria-label="Estatísticas de uso">
          <div className="diag-stat">
            <b>{stats.total}</b>
            <span>diagnósticos realizados</span>
          </div>
          <div className="diag-stat">
            <b>{stats.week}</b>
            <span>nos últimos 7 dias</span>
          </div>
          {stats.trails.slice(0, 2).map((t) => (
            <div className="diag-stat" key={t.key}>
              <b>{t.count}</b>
              <span>trilha {t.label.toLowerCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
