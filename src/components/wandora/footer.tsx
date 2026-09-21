"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <div>
            <p className="footer-brand">
              Wan<span className="acid">dora</span>
            </p>
            <p className="footer-tag">
              Funcionários Digitais com IA para pequenas e médias empresas.
              Contrate, treine, gerencie e avalie — junto com a sua equipe
              humana.
            </p>
          </div>

          <div className="footer-news">
            <label htmlFor="news-email">Boletim do futuro do trabalho</label>
            <form
              className="news-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
            >
              <input
                id="news-email"
                type="email"
                required
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sent}
              />
              <button type="submit" disabled={sent}>
                {sent ? "Inscrito ✓" : "Assinar"}
              </button>
            </form>
            {sent && (
              <p className="news-ok" role="status">
                Valeu! Você entra na próxima turma do boletim.
              </p>
            )}
          </div>
        </div>

        <div className="footer-cols">
          <nav className="footer-col" aria-label="Produto">
            <h4>Produto</h4>
            <ul>
              <li>
                <a href="#diagnostico">Diagnóstico de IA</a>
              </li>
              <li>
                <a href="#equipe">Equipe de funcionários</a>
              </li>
              <li>
                <a href="#o-que-e">O que é a Wandora</a>
              </li>
              <li>
                <a href="#como-funciona">Como funciona</a>
              </li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Informações">
            <h4>Info</h4>
            <ul>
              <li>
                <a href="#faq">Dúvidas frequentes</a>
              </li>
              <li>
                <a href="#faq">LGPD e privacidade</a>
              </li>
              <li>
                <a href="#captura">Falar com a Wandora</a>
              </li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Social">
            <h4>Social</h4>
            <ul>
              <li>
                <a href="#diagnostico">WhatsApp</a>
              </li>
              <li>
                <a href="#topo">Instagram</a>
              </li>
              <li>
                <a href="#topo">LinkedIn</a>
              </li>
              <li>
                <a href="#topo">YouTube</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Wandora — Funcionários Digitais com IA</span>
          <span>Não substituímos o seu time. A gente escala. ✦</span>
        </div>
      </div>
    </footer>
  );
}
