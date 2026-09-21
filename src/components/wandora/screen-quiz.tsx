"use client";

import { useEffect, useRef, useState } from "react";
import { QUESTIONS, type AnswerValue } from "@/lib/wandora/diagnostic";
import { ArrowLeft, Check } from "lucide-react";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ScreenQuiz({
  answers,
  onAnswer,
  onBack,
  onFinish,
  quizRef,
}: {
  answers: Record<string, AnswerValue>;
  onAnswer: (key: string, value: AnswerValue) => void;
  onBack: () => void;
  onFinish: (finalAnswers: Record<string, AnswerValue>) => void;
  quizRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [idx, setIdx] = useState(0);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const q = QUESTIONS[idx];
  const current = answers[q.key];
  const isLast = idx === QUESTIONS.length - 1;
  const progress = ((idx + (pending ? 1 : 0)) / QUESTIONS.length) * 100;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [idx]);

  function handleOption(v: string) {
    if (q.multi) {
      const arr = Array.isArray(current) ? [...current] : [];
      const at = arr.indexOf(v);
      if (at >= 0) arr.splice(at, 1);
      else arr.push(v);
      onAnswer(q.key, arr);
    } else {
      onAnswer(q.key, v);
      // resposta completa no instante do clique — evita closure stale no timeout
      const finalAnswers: Record<string, AnswerValue> = { ...answers, [q.key]: v };
      setPending(true);
      window.setTimeout(() => {
        setPending(false);
        if (isLast) onFinish(finalAnswers);
        else setIdx((i) => i + 1);
      }, 240);
    }
  }

  function handleContinue() {
    if (isLast) onFinish(answers);
    else setIdx((i) => i + 1);
  }

  function handleBack() {
    if (idx > 0) {
      setIdx((i) => i - 1);
      onBack();
    }
  }

  return (
    <div ref={quizRef} className="quiz-root" aria-label="Perguntas do diagnóstico">
      <div className="quiz-head" ref={scrollRef}>
        <div className="quiz-toprow">
          <p className="quiz-count">
            Pergunta <b>{idx + 1}</b> / {QUESTIONS.length}
          </p>
          <button
            type="button"
            className="quiz-back"
            onClick={handleBack}
            style={{ visibility: idx === 0 ? "hidden" : "visible" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar
          </button>
        </div>
        <div
          className="quiz-progress"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do diagnóstico"
        >
          <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div key={q.id}>
          <p className="quiz-eyebrow">{q.eyebrow}</p>
          <h3 className="quiz-title">{q.title}</h3>
          {q.multi && (
            <p className="quiz-hint">
              <span className="multi">Múltipla escolha</span> — {q.hint}
            </p>
          )}

          <div
            className="quiz-options"
            role={q.multi ? "group" : "radiogroup"}
            aria-label={q.title}
          >
            {q.options.map((o) => {
              const on = q.multi
                ? Array.isArray(current) && current.includes(o.v)
                : current === o.v;
              return (
                <button
                  type="button"
                  key={o.v}
                  className={`quiz-opt${on ? " is-on" : ""}`}
                  role={q.multi ? "checkbox" : "radio"}
                  aria-checked={on}
                  onClick={() => handleOption(o.v)}
                  disabled={pending}
                >
                  <span className="quiz-mark" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  {o.label.startsWith("“") && (
                    <span className="letter" aria-hidden="true">
                      {o.v})
                    </span>
                  )}
                  <span>{o.label}</span>
                </button>
              );
            })}
          </div>

          {q.multi && (
            <div className="quiz-nav">
              <span />
              <button
                type="button"
                className="btn-hard btn-sm"
                disabled={!Array.isArray(current) || current.length === 0}
                onClick={handleContinue}
              >
                {isLast ? "Ver meu resultado →" : "Continuar →"}
                {!isLast && Array.isArray(current) && current.length > 0 && (
                  <Check className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
