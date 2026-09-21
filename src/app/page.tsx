"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Nav } from "@/components/wandora/nav";
import { Hero } from "@/components/wandora/hero";
import { Marquee } from "@/components/wandora/marquee";
import { Thesis } from "@/components/wandora/thesis";
import { Team } from "@/components/wandora/team";
import { Cursor } from "@/components/wandora/cursor";
import {
  ScreenOpening,
  type Stats,
} from "@/components/wandora/screen-opening";
import { ScreenQuiz } from "@/components/wandora/screen-quiz";
import { ScreenResult } from "@/components/wandora/screen-result";
import { HowItWorks } from "@/components/wandora/how-it-works";
import { Faq } from "@/components/wandora/faq";
import { Footer } from "@/components/wandora/footer";
import { API } from "@/lib/wandora/config";
import {
  computeResult,
  type AnswerValue,
  type Answers,
  type ComputedResult,
} from "@/lib/wandora/diagnostic";
import { ArrowRight } from "lucide-react";

type Phase = "opening" | "quiz" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("opening");
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ComputedResult | null>(null);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const quizRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadStats = useCallback(() => {
    fetch(API.stats)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleStart() {
    setPhase("quiz");
    setAnswers({});
    setResult(null);
    setDiagnosticId(null);
    void fetch(API.events, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "start" }),
    }).catch(() => undefined);
    window.setTimeout(() => {
      quizRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }

  function handleAnswer(key: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleFinish(finalAnswers: Answers) {
    setAnswers(finalAnswers);
    const computed = computeResult(finalAnswers);
    setResult(computed);
    setPhase("result");
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    // registra no backend (valida + persiste + alimenta as stats públicas)
    void fetch(API.diagnostic, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: finalAnswers }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.id) setDiagnosticId(d.id as string);
        loadStats();
      })
      .catch(() => undefined);
  }

  function handleRestart() {
    setPhase("opening");
    setAnswers({});
    setResult(null);
    setDiagnosticId(null);
    void fetch(API.events, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "restart" }),
    }).catch(() => undefined);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />
      <Nav />

      <main className="flex-1" style={{ marginTop: "16px" }}>
        <Hero diagnosticsDone={stats?.total ?? 0} />

        <Marquee />

        <Thesis />

        <Team />

        {/* ------------------ diagnóstico ------------------ */}
        <section className="diag shell" id="diagnostico" aria-label="Diagnóstico de IA">
          <span className="kicker">Diagnóstico gratuito</span>
          <h2 className="sec-title">
            Descubra o funcionário digital{" "}
            <span className="glitch">certo pro seu caso</span>
          </h2>
          <p className="sec-sub">
            7 perguntas para identificar o processo que está vazando dinheiro
            hoje — e qual Funcionário Digital executa esse processo de ponta a
            ponta na sua operação.
          </p>

          <div className="diag-console">
            <div className="diag-strip">
              <span className="live">modo entrevista · respondendo agora</span>
              <span>7 perguntas · ~90 segundos · resultado imediato</span>
            </div>
            <div className="diag-inner">
              {phase === "opening" && (
                <ScreenOpening onStart={handleStart} stats={stats} />
              )}
              {phase === "quiz" && (
                <ScreenQuiz
                  answers={answers}
                  onAnswer={handleAnswer}
                  onBack={() => undefined}
                  onFinish={handleFinish}
                  quizRef={quizRef}
                />
              )}
              {phase === "result" && result && (
                <ScreenResult
                  result={result}
                  answers={answers}
                  diagnosticId={diagnosticId}
                  onRestart={handleRestart}
                  resultRef={resultRef}
                />
              )}
            </div>
          </div>
        </section>

        {/* ------------------ como funciona ------------------ */}
        <section className="how shell" aria-label="Como o diagnóstico funciona">
          <span className="kicker">Passo a passo</span>
          <h2 className="sec-title">
            Como o <span className="glitch">diagnóstico</span> funciona
          </h2>
          <p className="sec-sub">
            Nada de “compre uma ferramenta”: o diagnóstico aponta o processo
            que está vazando dinheiro hoje — e qual Funcionário Digital executa
            esse processo de ponta a ponta na sua operação.
          </p>
          <HowItWorks />
        </section>

        {/* ------------------ faq ------------------ */}
        <section className="faq shell" aria-label="Dúvidas frequentes">
          <span className="kicker">Dúvidas frequentes</span>
          <h2 className="sec-title">
            Antes de <span className="glitch">contratar</span>
          </h2>
          <p className="sec-sub">
            O que você precisa saber antes de colocar um Funcionário Digital
            pra trabalhar na sua empresa.
          </p>
          <Faq />
        </section>

        {/* ------------------ cta final ------------------ */}
        <section className="cta-final" aria-label="Chamada final">
          <div className="shell inner">
            <h2 className="display">
              <span className="glitch">Pronto pra</span>{" "}
              <span className="glitch">contratar?</span>
            </h2>
            <p>
              Em 90 segundos você sabe qual Funcionário Digital a sua empresa
              precisa — e os primeiros 30 dias já saem prontos.
            </p>
            <a href="#diagnostico" className="btn-ink">
              Fazer o diagnóstico grátis
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
