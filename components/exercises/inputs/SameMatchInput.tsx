"use client";

import { useState } from "react";
import {
  INITIAL_MATCH,
  isComplete,
  tapGroup,
  tapOption,
  toPairsArray,
} from "@/lib/learning/match-state";

type Card = { id: string; emoji: string; label?: string };

export function SameMatchInput({
  left,
  right,
  disabled = false,
  onComplete,
}: {
  left: Card[];
  right: Card[];
  disabled?: boolean;
  onComplete: (pairs: number[][]) => void;
}) {
  const [state, setState] = useState(INITIAL_MATCH);
  const colors = ["bg-mint", "bg-sky", "bg-pink", "bg-sun", "bg-lilac"];

  function handleLeft(i: number) {
    if (disabled) return;
    const next = tapGroup(state, i);
    setState(next);
    if (isComplete(next, left.length)) onComplete(toPairsArray(next));
  }

  function handleRight(i: number) {
    if (disabled) return;
    const next = tapOption(state, i);
    setState(next);
    if (isComplete(next, left.length)) onComplete(toPairsArray(next));
  }

  function colorForLeft(index: number): string | null {
    if (!(index in state.pairs)) return null;
    const order = Object.keys(state.pairs).map(Number).sort().indexOf(index);
    return colors[order % colors.length];
  }

  function colorForRight(index: number): string | null {
    const entry = Object.entries(state.pairs).find(([, v]) => v === index);
    return entry ? colorForLeft(Number(entry[0])) : null;
  }

  return (
    <div className="w-full max-w-md grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        {left.map((card, i) => (
          <MatchCard
            key={card.id}
            card={card}
            selected={state.selectedGroup === i}
            color={colorForLeft(i)}
            disabled={disabled}
            onClick={() => handleLeft(i)}
          />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {right.map((card, i) => (
          <MatchCard
            key={card.id}
            card={card}
            selected={state.selectedOption === i}
            color={colorForRight(i)}
            disabled={disabled}
            onClick={() => handleRight(i)}
          />
        ))}
      </div>
    </div>
  );
}

function MatchCard({
  card,
  selected,
  color,
  disabled,
  onClick,
}: {
  card: Card;
  selected: boolean;
  color: string | null;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected || color !== null}
      className={`btn-chunky min-h-24 py-3 px-3 rounded-2xl border-2 transition-colors ${
        color ? `${color} text-white border-white`
        : selected ? "bg-sky-soft border-sky text-ink"
        : "bg-white border-ink/10 text-ink"
      }`}
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      <div className="text-4xl md:text-5xl leading-none">{card.emoji}</div>
      {card.label && <div className="mt-1 text-xs font-black text-current">{card.label}</div>}
    </button>
  );
}
