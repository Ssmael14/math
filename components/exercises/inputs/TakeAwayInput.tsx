"use client";
// components/exercises/inputs/TakeAwayInput.tsx
// Resta concreta para pre-lectores 4-6: en vez de elegir un número, el niño
// SACA objetos tocándolos (se van volando con animación). Cuando sacó los
// `removed` que pedía el enunciado, confirma y al acertar se cuentan en voz
// los que quedaron — espejo del DragInput de sumas (concreto antes que
// abstracto). El kind sigue siendo MULTIPLE_CHOICE; sólo cambia la interacción
// cuando payload.visual === "subtract".

import { useEffect, useState } from "react";
import { playTap } from "@/lib/gamification/audio";
import { speak } from "@/lib/tts";
import { numberWord } from "@/lib/learning/number-words";

export function TakeAwayInput({
  total,
  removed,
  item,
  disabled = false,
  verified = false,
  onSubmit,
}: {
  total: number;
  removed: number;
  item: string;
  disabled?: boolean;
  /** true al acertar: cuenta en voz los que quedaron. */
  verified?: boolean;
  onSubmit: (remaining: number) => void;
}) {
  // Índices (en orden) que el niño ya sacó. Cap en `removed`.
  const [gone, setGone] = useState<number[]>([]);
  // -1 = sin contar; j = j-ésimo de los que quedan iluminado.
  const [countLit, setCountLit] = useState(-1);

  const goneSet = new Set(gone);
  const done = gone.length >= removed;
  const remainingIdx = Array.from({ length: total }, (_, i) => i).filter(
    (i) => !goneSet.has(i),
  );

  function takeAway(idx: number) {
    if (disabled || verified || goneSet.has(idx) || gone.length >= removed) return;
    playTap();
    setGone((cur) => [...cur, idx]);
  }

  // Conteo celebratorio de los que quedaron — mismo patrón que DragInput.
  // No bloquea: el footer del runner ya ofrece "Continuar" en paralelo.
  useEffect(() => {
    if (!verified) return;
    const n = remainingIdx.length;
    if (n === 0) return;
    let k = 0;
    setCountLit(-1);
    let timer = window.setTimeout(function tick() {
      setCountLit(k);
      void speak(numberWord(k + 1));
      k += 1;
      timer = window.setTimeout(
        k < n ? tick : () => setCountLit(n),
        k < n ? 650 : 700,
      );
    }, 350);
    return () => window.clearTimeout(timer);
    // remainingIdx es estable una vez verificado (input deshabilitado).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 select-none">
      <div className="text-[10px] font-black text-ink-mute tracking-widest">
        {done ? "AHORA CONTÁ LOS QUE QUEDAN" : `TOCÁ PARA SACAR ${removed}`}
      </div>

      <div className="w-full min-h-[120px] rounded-3xl border-4 border-dashed border-pink/50 bg-peach-soft/40 p-4">
        <div className="flex flex-wrap gap-3 md:gap-4 items-center justify-center">
          {Array.from({ length: total }).map((_, idx) => {
            const isGone = goneSet.has(idx);
            const litOrder = remainingIdx.indexOf(idx);
            const lit = countLit >= 0 && litOrder >= 0 && litOrder <= countLit;
            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || verified || isGone || done}
                onClick={() => takeAway(idx)}
                aria-label={isGone ? `${item} sacado` : `Sacar ${item}`}
                aria-hidden={isGone}
                className={`text-4xl md:text-5xl transition-transform duration-200 ${
                  isGone
                    ? "subtract-removed pointer-events-none"
                    : lit
                      ? "scale-125 drop-shadow"
                      : countLit >= 0
                        ? "opacity-40"
                        : "active:scale-90 hover:scale-105"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || !done}
        onClick={() => onSubmit(remainingIdx.length)}
        className={`btn-chunky w-full py-3 px-6 rounded-full font-black uppercase tracking-wide text-sm transition-colors ${
          !done ? "bg-ink-mute/20 text-ink-mute" : "bg-mint text-white"
        }`}
        style={{ boxShadow: !done ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        {done ? `Quedan ${remainingIdx.length}` : `Sacá ${removed - gone.length} más`}
      </button>
    </div>
  );
}
