"use client";

import { ArrowRight } from "lucide-react";

export function Nav() {
  return (
    <div className="nav-wrap">
      <nav className="nav" aria-label="Navegação principal">
        <a href="#topo" className="nav-logo" aria-label="Wandora — início">
          <span className="nav-logo-mark" aria-hidden="true">
            W
          </span>
          <span className="nav-logo-text">Wandora</span>
        </a>

        <div className="nav-links">
          <a href="#o-que-e">O que é</a>
          <a href="#equipe">Equipe</a>
          <a href="#diagnostico">Diagnóstico</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#faq">FAQ</a>
        </div>

        <a href="#diagnostico" className="nav-cta">
          Fazer o diagnóstico
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </nav>
    </div>
  );
}
