"use client";

import { useEffect, useState } from "react";
import { API, WANDORA } from "@/lib/wandora/config";
import { Send } from "lucide-react";

type StatusKind = "idle" | "loading" | "success" | "error";

export function LeadForm({
  diagnosticId,
  waHref,
  trailKey,
}: {
  diagnosticId: string | null;
  waHref: string;
  trailKey: string;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<StatusKind>("idle");
  const [statusMsg, setStatusMsg] = useState("");

  // deep-link do WhatsApp recompõe com nome/empresa quando preenchidos
  const [liveWa, setLiveWa] = useState(waHref);
  useEffect(() => {
    setLiveWa(waHref);
  }, [waHref]);

  useEffect(() => {
    try {
      const url = new URL(waHref);
      const text = url.searchParams.get("text") || "";
      let who = "";
      if (name) who += name;
      if (company) who += (who ? " (" : "") + company + (who ? ")" : "");
      const saud = who ? `Olá! Aqui é ${who}. ` : "Olá! ";
      const idx = text.indexOf("Vim do Diagnóstico");
      const base = idx >= 0 ? text.slice(idx) : text;
      const full = saud + base;
      url.searchParams.set("text", full);
      setLiveWa(url.toString());
    } catch {
      /* noop */
    }
  }, [name, company, waHref]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setStatusMsg("Enviando seu diagnóstico…");
    try {
      const res = await fetch(API.lead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diagnosticId,
          contact: { name, company, whatsapp, email },
          consent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setStatusMsg(
          (data as { error?: string }).error ||
            "Não foi possível enviar. Tente de novo em instantes."
        );
        return;
      }
      setStatus("success");
      setStatusMsg(
        (data as { message?: string }).message ||
          "Recebido! A equipe Wandora vai entrar em contato."
      );
    } catch {
      setStatus("error");
      setStatusMsg("Falha de conexão. Tente novamente.");
    }
  }

  return (
    <div className="capture" id="captura">
      <h3>
        Leve esse diagnóstico pra {WANDORA.assistantName} no WhatsApp
      </h3>
      <p className="sub">
        Toque no botão: a mensagem já vai montada com a sua trilha e o seu
        contexto. Você envia, a {WANDORA.assistantName} responde na hora — sem
        formulário, sem espera. Ou deixe seu contato e o time Wandora te chama.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="cap-fields">
          <div className="cap-field">
            <label htmlFor="cap-nome">Nome (opcional)</label>
            <input
              id="cap-nome"
              type="text"
              placeholder="Como te chamamos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="cap-field">
            <label htmlFor="cap-empresa">Empresa (opcional)</label>
            <input
              id="cap-empresa"
              type="text"
              placeholder="Nome da empresa"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
            />
          </div>
          <div className="cap-field">
            <label htmlFor="cap-whats">WhatsApp (com DDD)</label>
            <input
              id="cap-whats"
              type="tel"
              inputMode="tel"
              placeholder="11 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="cap-field">
            <label htmlFor="cap-email">E-mail</label>
            <input
              id="cap-email"
              type="email"
              placeholder="voce@empresa.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
        </div>

        <label className="cap-consent" htmlFor="cap-consent">
          <input
            id="cap-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Autorizo a Wandora a usar meus dados e as respostas do diagnóstico
            para entrar em contato sobre Funcionários Digitais (LGPD — Lei
            13.709/2018). Posso pedir exclusão a qualquer momento.
          </span>
        </label>

        <div className="cap-actions">
          <button
            type="submit"
            className="btn-hard"
            disabled={status === "loading" || !consent}
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            {status === "loading" ? "Enviando…" : "Quero que a Wandora me chame"}
          </button>
          <a
            id="cap-wa"
            href={liveWa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-paper"
            onClick={() => {
              void fetch(API.events, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "whatsapp_click", trailKey }),
              }).catch(() => undefined);
            }}
          >
            Enviar pro WhatsApp agora →
          </a>
        </div>

        <p
          className="cap-status"
          data-kind={status}
          role="status"
          aria-live="polite"
        >
          {statusMsg}
        </p>
      </form>

      <p className="cap-micro">
        Sem compromisso — o resultado acima é seu de qualquer jeito. O contato
        serve para desenhar o próximo passo com quem entende do seu processo.
      </p>
    </div>
  );
}
