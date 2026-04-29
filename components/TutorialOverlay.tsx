"use client";
// components/TutorialOverlay.tsx
// Tutorial del primer día: spotlight + tooltips secuenciales sobre los
// elementos clave del /home. Se muestra una sola vez por dispositivo
// (persistido en localStorage).
//
// Cada elemento target se identifica con un atributo data-tour="<key>" en
// HomeClient. Si un selector no resuelve (porque la UI cambió o el elemento
// está oculto), saltamos ese paso silenciosamente para no trabar al niño.

import { useEffect, useState } from "react";
import { playTap } from "@/lib/audio";

const STORAGE_KEY = "lm_tutorial_done_v1";
const PADDING = 8;

type Step = {
  selector: string;
  title: string;
  text: string;
};

const STEPS: Step[] = [
  {
    selector: "[data-tour='unit-card']",
    title: "Tu unidad de hoy",
    text: "Acá ves cuánto te falta para terminarla. Cada burbuja del mapa es una lección 📚",
  },
  {
    selector: "[data-tour='review-card']",
    title: "Repaso del día",
    text: "Volvé todos los días para mantener tu racha 🔥 y refrescar lo que aprendiste",
  },
  {
    selector: "[data-tour='current-lesson']",
    title: "¡Empezá acá!",
    text: "Tocá la burbuja con Lumi para arrancar tu primera lección 🦙",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function TutorialOverlay() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);

  // Mostrar al primer mount si no se completó antes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      return;
    }
    // Pequeño delay para que el DOM termine de hidratarse.
    const t = setTimeout(() => setStep(0), 350);
    return () => clearTimeout(t);
  }, []);

  // Cuando cambia el step, encontrar el elemento target y guardar su rect.
  useEffect(() => {
    if (step === null) return;
    const target = STEPS[step];
    const el = document.querySelector(target.selector);
    if (!(el instanceof HTMLElement)) {
      // Selector no encontrado — saltar este paso.
      advance();
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    // Esperamos un tick para que el scroll termine antes de medir.
    const t = setTimeout(update, 320);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function advance() {
    playTap();
    setRect(null);
    setStep((s) => {
      if (s === null) return null;
      if (s + 1 >= STEPS.length) {
        finish();
        return null;
      }
      return s + 1;
    });
  }

  function finish() {
    setRect(null);
    setStep(null);
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
  }
  function skip() {
    playTap();
    finish();
  }

  if (step === null || rect === null) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  // Decidimos si el tooltip va arriba o abajo del target según el espacio.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const placeBelow = rect.top + rect.height + 200 < vh;
  const tooltipTop = placeBelow ? rect.top + rect.height + 16 : Math.max(16, rect.top - 220);

  // Halo + 4 paneles oscuros que rodean el target, dejándolo "iluminado".
  const haloStyle = {
    top: rect.top - PADDING,
    left: rect.left - PADDING,
    width: rect.width + PADDING * 2,
    height: rect.height + PADDING * 2,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tutorial paso ${step + 1} de ${STEPS.length}: ${current.title}`}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Backdrop oscuro alrededor del target — 4 rectángulos clickeables */}
      <div className="fixed bg-black/55 pointer-events-auto cursor-pointer"
           style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PADDING) }}
           onClick={advance}/>
      <div className="fixed bg-black/55 pointer-events-auto cursor-pointer"
           style={{ top: rect.top + rect.height + PADDING, left: 0, right: 0, bottom: 0 }}
           onClick={advance}/>
      <div className="fixed bg-black/55 pointer-events-auto cursor-pointer"
           style={{ top: rect.top - PADDING, height: rect.height + PADDING * 2, left: 0, width: Math.max(0, rect.left - PADDING) }}
           onClick={advance}/>
      <div className="fixed bg-black/55 pointer-events-auto cursor-pointer"
           style={{ top: rect.top - PADDING, height: rect.height + PADDING * 2, left: rect.left + rect.width + PADDING, right: 0 }}
           onClick={advance}/>

      {/* Halo amarillo alrededor del target (no intercepta clicks) */}
      <div
        className="fixed border-4 border-sun rounded-2xl animate-pulse-soft pointer-events-none"
        style={{ ...haloStyle, boxShadow: "0 0 0 9999px rgba(0,0,0,0)" }}
        aria-hidden
      />

      {/* Tooltip con texto + CTA */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[101] pointer-events-auto w-[min(360px,calc(100vw-32px))]"
        style={{ top: tooltipTop }}
      >
        <div className="bg-white rounded-2xl p-4 border-4 border-white" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sun-soft flex items-center justify-center text-2xl flex-shrink-0" aria-hidden>🦙</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black tracking-widest text-ink-mute mb-0.5">
                PASO {step + 1} / {STEPS.length}
              </div>
              <div className="font-fredoka font-bold text-ink leading-tight">
                {current.title}
              </div>
              <p className="text-sm text-ink-soft mt-1">
                {current.text}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 mt-3">
            <button
              type="button"
              onClick={skip}
              className="text-xs font-bold text-ink-mute underline"
            >
              Saltar
            </button>
            <button
              type="button"
              onClick={advance}
              className="btn-chunky py-2 px-5 rounded-full bg-ink text-white font-black uppercase tracking-wide text-xs"
              style={{ boxShadow: "0 3px 0 rgba(0,0,0,0.25)" }}
            >
              {isLast ? "¡A jugar!" : "Siguiente →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
