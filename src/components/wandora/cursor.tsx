"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor customizado estilo Neo-Brutalista:
 * círculo branco 32px com mix-blend-difference, segue o mouse com
 * lerp 0.2 e escala 2.5x sobre elementos interativos.
 * Desativado em telas touch (pointer: coarse).
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    let targetX = -100;
    let targetY = -100;
    let x = -100;
    let y = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const INTERACTIVE_SELECTOR =
      'a, button, input, textarea, select, label, summary, [role="button"], [role="checkbox"], [role="radio"]';

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && el.closest(INTERACTIVE_SELECTOR)) {
        dot.classList.add("is-big");
      } else {
        dot.classList.remove("is-big");
      }
    };

    const loop = () => {
      // lerp 0.2 — movimento suave atrás do ponteiro
      x += (targetX - x) * 0.2;
      y += (targetY - y) * 0.2;
      dot.style.transform = `translate(${x - dot.offsetWidth / 2}px, ${
        y - dot.offsetHeight / 2
      }px)`;
      raf = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={dotRef} className="cursor-dot" aria-hidden="true" />;
}
