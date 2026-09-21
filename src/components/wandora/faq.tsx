"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "O resultado chega na hora?",
    a: "Sim. As 7 perguntas levam ~90 segundos e o diagnóstico (trilha, urgência, estimador de retorno e plano de 30 dias) aparece imediatamente — sem login, sem espera, sem e-mail para receber. O contato é opcional e só aparece no fim, se você quiser dar o próximo passo.",
  },
  {
    q: "O que é um Funcionário Digital com IA?",
    a: "É um profissional de Inteligência Artificial desenhado para executar tarefas reais dentro da empresa: atender clientes, qualificar leads, agendar visitas, atualizar dados comerciais e automatizar processos que hoje dependem de trabalho manual. A diferença central é execução: um sistema comum responde perguntas; o Funcionário Digital entende contexto, consulta dados, decide o próximo passo e registra tudo no painel.",
  },
  {
    q: "Funcionário Digital é a mesma coisa que chatbot?",
    a: "Não. Chatbot de fluxo segue script fixo e trava fora do roteiro. Funcionário Digital se conecta aos seus sistemas, entende contexto, toma decisões e leva o processo até o fim — com transferência para humano quando o caso exige. Regra prática: se a conversa precisa virar lead, tarefa ou oportunidade, é Funcionário Digital.",
  },
  {
    q: "Por onde eu começo: pela ferramenta ou pelo processo?",
    a: "Pelo processo. O erro comum é começar pela ferramenta. O caminho correto é começar pela tarefa que mais perde tempo, dinheiro ou oportunidade hoje — normalmente atendimento no WhatsApp, qualificação de leads, agendamento, follow-up ou registro no CRM. É exatamente isso que o diagnóstico identifica.",
  },
  {
    q: "Quanto custa? Como sei se vale a pena?",
    a: "Depende menos do modelo de IA e mais do processo que ele executa: integração, regras de transferência e volume. O jeito certo de avaliar é por ROI — quantas conversas você recupera respondendo na hora, quantas horas do time são devolvidas, quantas oportunidades deixam de esfriar. Use o estimador de retorno dentro do resultado para uma primeira projeção com os seus números.",
  },
  {
    q: "A IA substitui o meu time?",
    a: "Não — ela prepara o seu time para entrar melhor. A IA executa o repetitivo e escala exceções; o humano entra em casos sensíveis, negociações complexas e decisões que exigem julgamento. A LGPD é respeitada em todo o fluxo: consentimento explícito, dado usado só para o contato combinado e exclusão a qualquer momento.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list" id="faq">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className="faq-item" data-open={isOpen} key={i}>
            <button
              type="button"
              className="faq-q"
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
              id={`faq-q-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span>{item.q}</span>
              <Plus aria-hidden="true" />
            </button>
            <div
              className="faq-a"
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              style={{ maxHeight: isOpen ? "420px" : "0px" }}
            >
              <div className="faq-a-inner">
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
