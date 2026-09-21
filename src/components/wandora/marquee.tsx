"use client";

const ITEMS = [
  "Não bate ponto",
  "Não tira férias",
  "Atende 24/7",
  "Aprende todo dia",
  "Integra seus sistemas",
  "Sem aviso prévio",
  "Escala sem contratar",
  "Sem hora extra",
];

function Row() {
  return (
    <>
      {ITEMS.map((t) => (
        <span key={t} aria-hidden="true">
          {t} ✦
        </span>
      ))}
    </>
  );
}

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <Row />
        <Row />
      </div>
    </div>
  );
}
