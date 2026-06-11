"use client";

import { useRef, useState } from "react";
import {
  INITIAL_MATCH,
  isComplete,
  tapGroup,
  tapOption,
  toPairsArray,
} from "@/lib/learning/match-state";
import { MATCH_PALETTE, MatchPairLines } from "./MatchPairLines";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftRefs = useRef<Array<HTMLElement | null>>([]);
  const rightRefs = useRef<Array<HTMLElement | null>>([]);

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
    return MATCH_PALETTE[order % MATCH_PALETTE.length].bg;
  }

  function colorForRight(index: number): string | null {
    const entry = Object.entries(state.pairs).find(([, v]) => v === index);
    return entry ? colorForLeft(Number(entry[0])) : null;
  }

  return (
    <div ref={containerRef} className="relative grid w-full max-w-md grid-cols-2 gap-4">
      <MatchPairLines
        containerRef={containerRef}
        leftRefs={leftRefs}
        pairs={state.pairs}
        rightRefs={rightRefs}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {left.map((card, i) => (
          <MatchCard
            key={card.id}
            card={card}
            elementRef={(node) => {
              leftRefs.current[i] = node;
            }}
            selected={state.selectedGroup === i}
            color={colorForLeft(i)}
            disabled={disabled}
            onClick={() => handleLeft(i)}
          />
        ))}
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        {right.map((card, i) => (
          <MatchCard
            key={card.id}
            card={card}
            elementRef={(node) => {
              rightRefs.current[i] = node;
            }}
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
  elementRef,
  selected,
  color,
  disabled,
  onClick,
}: {
  card: Card;
  elementRef: (node: HTMLButtonElement | null) => void;
  selected: boolean;
  color: string | null;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      ref={elementRef}
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
