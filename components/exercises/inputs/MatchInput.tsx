"use client";
// components/exercises/inputs/MatchInput.tsx
// UI tap-to-pair: dos columnas, izquierda = grupos visuales (emoji × N),
// derecha = números. El niño tapea un grupo, después un número, y se
// emparejan visualmente con un color asignado.
//
// Cuando todos los grupos están emparejados, llama onComplete con los
// pares en formato [[groupIdx, optionIdx], …].

import { useState } from "react";
import {
  INITIAL_MATCH,
  tapGroup,
  tapOption,
  isComplete,
  toPairsArray,
} from "@/lib/learning/match-state";

type Group = { item: string; count: number };

export function MatchInput({
  groups,
  options,
  disabled = false,
  onComplete,
}: {
  groups: Group[];
  options: number[];
  disabled?: boolean;
  onComplete: (pairs: number[][]) => void;
}) {
  const [state, setState] = useState(INITIAL_MATCH);

  function handleGroup(i: number) {
    if (disabled) return;
    const next = tapGroup(state, i);
    setState(next);
    if (isComplete(next, groups.length)) onComplete(toPairsArray(next));
  }
  function handleOption(i: number) {
    if (disabled) return;
    const next = tapOption(state, i);
    setState(next);
    if (isComplete(next, groups.length)) onComplete(toPairsArray(next));
  }

  // Asignamos un color por par en orden de creación, así el feedback visual
  // es claro sin tener que dibujar líneas.
  const COLORS = ["bg-mint", "bg-sky", "bg-pink", "bg-sun", "bg-lilac"];
  const colorFor = (groupIdx: number): string | null => {
    if (!(groupIdx in state.pairs)) return null;
    const idx = Object.keys(state.pairs).map(Number).sort().indexOf(groupIdx);
    return COLORS[idx % COLORS.length];
  };
  const colorForOption = (optionIdx: number): string | null => {
    const entry = Object.entries(state.pairs).find(([, v]) => v === optionIdx);
    if (!entry) return null;
    return colorFor(Number(entry[0]));
  };

  return (
    <div className="w-full max-w-md grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        {groups.map((g, i) => {
          const c = colorFor(i);
          const selected = state.selectedGroup === i;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleGroup(i)}
              aria-label={`Grupo ${i + 1}: ${g.count} items`}
              aria-pressed={selected || c !== null}
              className={`btn-chunky py-3 px-3 rounded-2xl border-2 transition-colors ${
                c ? `${c} text-white border-white` :
                selected ? "bg-sky-soft border-sky text-ink" :
                "bg-white border-ink/10 text-ink"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <div className="flex flex-wrap justify-center gap-0.5 text-2xl md:text-3xl leading-none">
                {Array.from({ length: g.count }).map((_, k) => (
                  <span key={k}>{g.item}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {options.map((n, i) => {
          const c = colorForOption(i);
          const selected = state.selectedOption === i;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleOption(i)}
              aria-label={`Opción ${n}`}
              aria-pressed={selected || c !== null}
              className={`btn-chunky py-4 rounded-2xl border-2 font-fredoka text-3xl font-bold transition-colors ${
                c ? `${c} text-white border-white` :
                selected ? "bg-sky-soft border-sky text-ink" :
                "bg-white border-ink/10 text-ink"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
