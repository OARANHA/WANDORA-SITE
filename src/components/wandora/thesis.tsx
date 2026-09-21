"use client";

import { Bot, Gauge, Lock, MemoryStick, Wrench } from "lucide-react";

export function Thesis() {
  return (
    <section className="thesis shell" id="o-que-e" aria-label="O que é a Wandora">
      <span className="kicker">O que é a Wandora</span>
      <h2 className="sec-title">
        Não é mais uma <span className="glitch">ferramenta</span>. É a sua
        empresa operando.
      </h2>
      <p className="sec-sub">
        A Wandora é a <strong>camada operacional</strong> da sua empresa: o
        lugar onde você vê pessoas e funcionários digitais trabalhando
        juntos — com decisões, resultados e limites claros.
      </p>

      <div className="bento">
        {/* card grande escuro 2x2 */}
        <article className="bento-card bento-big">
          <div className="bento-bg" aria-hidden="true" />
          <span className="b-tag" style={{ alignSelf: "flex-start" }}>
            A visão do dono
          </span>
          <h3>Uma só equipe</h3>

          <div className="team-panel" aria-label="Exemplo da visão do dono na Wandora: pessoas e funcionários digitais no mesmo painel">
            <div className="tp-head">
              <span className="tp-title">Equipe · agora</span>
              <span className="tp-live">
                <i className="tp-live-dot" aria-hidden="true" />
                ao vivo
              </span>
            </div>

            <ul className="tp-rows">
              <li>
                <span className="tp-ava tp-ava-bot" aria-hidden="true">FD</span>
                <div className="tp-who">
                  <b>Aurora</b>
                  <span>Atendimento · digital</span>
                </div>
                <span className="tp-status">
                  <i className="tp-dot" aria-hidden="true" />
                  respondendo cliente
                </span>
              </li>
              <li>
                <span className="tp-ava tp-ava-bot" aria-hidden="true">FD</span>
                <div className="tp-who">
                  <b>Rafa</b>
                  <span>SDR · digital</span>
                </div>
                <span className="tp-status">
                  <i className="tp-dot" aria-hidden="true" />
                  3 leads qualificando
                </span>
              </li>
              <li>
                <span className="tp-ava tp-ava-human" aria-hidden="true">CM</span>
                <div className="tp-who">
                  <b>Camila</b>
                  <span>Vendas · humana</span>
                </div>
                <span className="tp-status tp-status-human">
                  <i className="tp-dot tp-dot-human" aria-hidden="true" />
                  fechando proposta
                </span>
              </li>
            </ul>

            <div className="tp-approval">
              <div className="tp-approval-head">
                <span className="tp-approval-tag">Aprovação</span>
                <span>
                  Aurora pediu: <b>desconto 12% · pedido #1284</b>
                </span>
              </div>
              <div className="tp-actions">
                <span className="tp-btn">Aprovar</span>
                <span className="tp-btn tp-btn-ghost">Revisar</span>
              </div>
            </div>

            <div className="tp-results">
              <span className="tp-res-label">Hoje</span>
              <span className="tp-res-item">
                <b>47</b> atendimentos
              </span>
              <span className="tp-res-item">
                <b>14/14</b> orçamentos
              </span>
              <span className="tp-res-item tp-res-ok">
                <b>100%</b> da meta
              </span>
            </div>
          </div>

          <p>
            Pessoas e funcionários digitais no mesmo lugar. Você vê o{" "}
            <strong>trabalho em andamento</strong>, as{" "}
            <strong>decisões</strong> que estão sendo tomadas e os{" "}
            <strong>resultados</strong> — sem planilha paralela e sem
            adivinhação.
          </p>
        </article>

        <article className="bento-card dots">
          <span className="b-tag" style={{ background: "var(--paper)" }}>
            <Lock className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Confiança
          </span>
          <h3>Autonomia com limites</h3>
          <p>
            Cada funcionário digital tem{" "}
            <strong>limites de autonomia</strong> e aprovações claras,
            definidos por você. Ele executa — e sobe pro humano o que
            realmente precisa de humano.
          </p>
        </article>

        <article className="bento-card bento-acid">
          <span className="b-tag" style={{ background: "var(--paper)" }}>
            <MemoryStick className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Memória
          </span>
          <h3>Memória operacional</h3>
          <p>
            Contexto empresarial compartilhado e memória estruturada: o
            atendimento de amanhã começa{" "}
            <strong>mais inteligente</strong> que o de hoje.
          </p>
        </article>

        <article className="bento-card dots">
          <span className="b-tag" style={{ background: "var(--paper)" }}>
            <Wrench className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Ferramentas
          </span>
          <h3>Ferramentas, não conectores</h3>
          <p>
            CRM, mensagens, agenda e finanças viram{" "}
            <strong>ferramentas que os funcionários usam</strong> — não
            integrações técnicas que você precisa configurar.
          </p>
        </article>

        <article className="bento-card dots">
          <span className="b-tag" style={{ background: "var(--paper)" }}>
            <Gauge className="mr-1 inline h-3 w-3" aria-hidden="true" />
            Gestão
          </span>
          <h3>Contratar, treinar, avaliar</h3>
          <p>
            Você gerencia um funcionário digital como gerencia gente:{" "}
            <strong>treina, acompanha, avalia</strong> — e promove o que
            performa.
          </p>
        </article>

        {/* card largo: o que a Wandora NÃO é */}
        <article className="bento-card bento-wide" style={{ gridColumn: "1 / -1" }}>
          <span className="b-tag">
            <Bot className="mr-1 inline h-3 w-3" aria-hidden="true" />
            O que a Wandora não é
          </span>
          <div className="not-pills">
            <span className="not-pill">Chatbot</span>
            <span className="not-pill">Construtor de fluxos</span>
            <span className="not-pill">Plataforma genérica de agentes</span>
            <span className="not-pill">CRM com IA</span>
          </div>
          <p style={{ marginTop: 12 }}>
            Seus sistemas de CRM, mensagens, agendamento e finanças são{" "}
            <strong>ferramentas</strong> usadas pelos funcionários dentro de
            uma empresa governada pela Wandora.
          </p>
        </article>
      </div>
    </section>
  );
}
