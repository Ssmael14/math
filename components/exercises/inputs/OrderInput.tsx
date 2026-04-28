"use client";
// components/exercises/inputs/OrderInput.tsx
// UI tap-in-sequence: una grilla con los números desordenados; el niño los
// tapea en el orden que cree correcto. Cada tap los mueve a unos "slots"
// arriba (1°, 2°, …). Tap sobre un número ya colocado lo devuelve abajo.
//
// Cuando todos están colocados, dispara onComplete con el array.

import { useState } from "react";
import { INITIAL_ORDER, toggle, isComplete } from "@/lib/order-state";

export function OrderInput({
  numbers,
  disabled = false,
  onComplete,
}: {
  numbers: number[];
  disabled?: boolean;
  onComplete: (sequence: number[]) => void;
}) {
  const [state, setState] = useState(INITIAL_ORDER);

  function handle(value: number) {
    if (disabled) return;
    const next = toggle(state, value);
    setState(next);
    if (isComplete(next, numbers.length)) onComplete(next.picked);
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4">
      {/* Slots arriba con los números ya elegidos en orden */}
      <div
        className="w-full grid gap-2"
        style={{ gridTemplateColumns: `repeat(${numbers.length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: numbers.length }).map((_, i) => {
          const v = state.picked[i];
          return (
            <div
              key={i}
              className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center font-fredoka text-2xl md:text-3xl font-bold ${
                v !== undefined ? "border-mint bg-mint-soft text-ink" : "border-ink/10 bg-white/60 text-ink-mute"
              }`}
              aria-label={`Posición ${i + 1}: ${v ?? "vacía"}`}
            >
              {v !== undefined ? v : i + 1}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest">DEL MENOR AL MAYOR</div>

      {/* Pool abajo con los números a tapear */}
      <div className="w-full grid grid-cols-4 gap-2">
        {numbers.map((n) => {
          const taken = state.picked.includes(n);
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => handle(n)}
              aria-label={`Número ${n}${taken ? " (ya elegido)" : ""}`}
              aria-pressed={taken}
              className={`btn-chunky py-4 rounded-2xl border-2 font-fredoka text-2xl md:text-3xl font-bold transition-colors ${
                taken
                  ? "bg-cream border-ink/10 text-ink-mute opacity-50"
                  : "bg-white border-ink/10 text-ink hover:border-ink/30"
              }`}
              style={{ boxShadow: taken ? "none" : "var(--shadow-chunky)" }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
