"use client";
// components/exercises/inputs/CountTapInput.tsx
// Contar tocando: correspondencia uno-a-uno, la base del conteo para 4-6.
// En vez de elegir un número (abstracto), el niño toca cada objeto; cada
// toque lo numera y Lumi dice el número en voz. El último número es la
// cantidad (principio de cardinalidad). Mismo patrón concreto+voz que el
// DragInput de sumas y el TakeAwayInput de restas.

import { useEffect, useState } from "react";
import { playTap, playCorrect } from "@/lib/gamification/audio";
import { speak } from "@/lib/tts";
import { numberWord } from "@/lib/learning/number-words";
import { countCols, countSizeCls } from "@/lib/learning/visual-layout";

export function CountTapInput({
  count,
  item,
  disabled = false,
  verified = false,
  onSubmit,
}: {
  count: number;
  item: string;
  disabled?: boolean;
  /** true al acertar: cierra repitiendo el total en voz. */
  verified?: boolean;
  onSubmit: (counted: number) => void;
}) {
  // Índices tocados, en orden (el orden = el número que le tocó a cada uno).
  const [tapped, setTapped] = useState<number[]>([]);
  const tappedSet = new Set(tapped);
  const n = tapped.length;

  function tap(idx: number) {
    if (disabled || verified || tappedSet.has(idx)) return;
    playTap();
    void speak(numberWord(n + 1));
    setTapped((cur) => [...cur, idx]);
  }

  // Cierre al acertar: "¡cinco!" — fija la cardinalidad (último = total).
  useEffect(() => {
    if (!verified || n === 0) return;
    const t = window.setTimeout(() => {
      playCorrect();
      void speak(`¡${numberWord(n)}!`);
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verified]);

  const cols = countCols(count);
  const sizeCls = countSizeCls(count);

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 select-none">
      <div className="text-[10px] font-black text-ink-mute tracking-widest">
        {n === 0 ? "TOCÁ CADA UNO PARA CONTAR" : `CONTASTE ${n}`}
      </div>

      <div className="w-full rounded-3xl border-4 border-dashed border-sky/50 bg-sky-soft/30 p-4">
        <div
          className="grid justify-center gap-3 md:gap-4 mx-auto"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
        >
          {Array.from({ length: count }).map((_, idx) => {
            const order = tapped.indexOf(idx);
            const isTapped = order >= 0;
            return (
              <button
                key={idx}
                type="button"
                disabled={disabled || verified || isTapped}
                onClick={() => tap(idx)}
                aria-label={
                  isTapped ? `${item} número ${order + 1}` : `Contar ${item}`
                }
                className={`relative ${sizeCls} leading-none transition-transform duration-150 ${
                  isTapped
                    ? "scale-110"
                    : "opacity-70 hover:opacity-100 active:scale-90"
                }`}
              >
                {item}
                {isTapped && (
                  <span
                    className="absolute -top-1 -right-1 grid place-items-center w-6 h-6 md:w-7 md:h-7 rounded-full bg-sky text-white font-fredoka font-bold text-xs md:text-sm"
                    aria-hidden
                  >
                    {order + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || n === 0}
        onClick={() => onSubmit(n)}
        className={`btn-chunky w-full py-3 px-6 rounded-full font-black uppercase tracking-wide text-sm transition-colors ${
          n === 0 ? "bg-ink-mute/20 text-ink-mute" : "bg-mint text-white"
        }`}
        style={{ boxShadow: n === 0 ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        {n === 0 ? "Tocá los objetos" : `Hay ${n}`}
      </button>
    </div>
  );
}
