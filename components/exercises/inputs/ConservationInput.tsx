"use client";

import { useEffect, useRef, useState } from "react";
import {
  Equal,
  Minus,
  Plus,
  RefreshCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";

type ConservationChoice = "más" | "menos" | "igual";
type LayoutName = "circle" | "close" | "compact" | "row" | "spread";
type Phase = "before" | "mix" | "after";

type Position = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

export function ConservationInput({
  afterLayout = "spread",
  beforeLayout = "row",
  choices,
  count,
  disabled = false,
  item,
  selected = null,
  onPick,
}: {
  afterLayout?: string;
  beforeLayout?: string;
  choices: ConservationChoice[];
  count: number;
  disabled?: boolean;
  item: string;
  selected?: ConservationChoice | null;
  onPick: (value: ConservationChoice) => void;
}) {
  const [phase, setPhase] = useState<Phase>("before");
  const timerRef = useRef<number | null>(null);
  const beforePositions = positionsForLayout(safeLayout(beforeLayout), count);
  const afterPositions = positionsForLayout(safeLayout(afterLayout), count);
  const positions =
    phase === "after"
      ? afterPositions
      : phase === "mix"
        ? mixPositions(count)
        : beforePositions;
  const moved = phase === "after";
  const mixing = phase === "mix";

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function handleMagic() {
    if (disabled || mixing) return;

    if (moved) {
      setPhase("before");
      return;
    }

    setPhase("mix");
    timerRef.current = window.setTimeout(() => {
      setPhase("after");
      timerRef.current = null;
    }, 720);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="w-full rounded-[2rem] bg-sky-soft/45 p-4 md:p-5">
        <div className="relative mx-auto h-[230px] w-full max-w-xl overflow-hidden rounded-[1.75rem] border-4 border-sky/25 bg-white md:h-[260px]">
          <div className="absolute inset-x-5 bottom-5 h-4 rounded-full bg-ink/10" />

          {mixing && (
            <div className="absolute left-1/2 top-1/2 z-10 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-peach-soft/80 text-sun shadow-[0_0_0_12px_rgba(255,206,105,0.18),0_18px_44px_rgba(16,32,66,0.16)]">
              <Sparkles className="h-12 w-12 animate-spin" aria-hidden />
            </div>
          )}

          {Array.from({ length: count }).map((_, index) => {
            const position = positions[index] ?? positions[0] ?? fallbackPosition;
            return (
              <div
                key={index}
                className={`absolute z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-4xl leading-none shadow-[0_10px_24px_rgba(16,32,66,0.12)] transition-all duration-[650ms] ease-in-out md:h-16 md:w-16 md:text-5xl ${
                  moved ? "ring-4 ring-mint/25" : mixing ? "ring-4 ring-peach/30" : ""
                }`}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${position.rotate}deg) scale(${position.scale})`,
                  transitionDelay: mixing ? `${index * 35}ms` : `${index * 65}ms`,
                }}
                aria-label={`${item} ${index + 1}`}
              >
                {item}
              </div>
            );
          })}

          <div
            className={`absolute z-30 flex h-16 w-16 items-center justify-center rounded-full bg-peach-soft text-sun shadow-[0_12px_30px_rgba(16,32,66,0.14)] transition-all duration-700 ${
              mixing
                ? "left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 -rotate-12 scale-110 opacity-100"
                : moved
                ? "left-[88%] top-[18%] -translate-x-1/2 -translate-y-1/2 rotate-12 scale-[0.8] opacity-80"
                : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-0 scale-100 opacity-100"
            }`}
            aria-hidden
          >
            <WandSparkles className="h-9 w-9" strokeWidth={2.8} />
          </div>

          {moved && (
            <SameCountBadge count={count} />
          )}
        </div>

        <button
          type="button"
          disabled={disabled || mixing}
          onClick={handleMagic}
          className="btn-chunky mx-auto mt-4 flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl border-2 border-sky bg-white px-5 font-fredoka text-lg font-bold text-ink disabled:opacity-50"
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          {moved ? (
            <RefreshCcw className="h-6 w-6" aria-hidden />
          ) : (
            <WandSparkles className="h-6 w-6" aria-hidden />
          )}
          {mixing ? "Mezclando..." : moved ? "Ver otra vez" : "Toca la varita"}
        </button>
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute md:text-xs">
        {moved ? "Ahora responde" : mixing ? "El mago esta mezclando" : "Primero mira como se mueven"}
      </div>

      <div className="grid w-full max-w-xl grid-cols-3 gap-3">
        {choices.map((choice) => {
          const isSelected = selected === choice;
          return (
            <button
              key={choice}
              type="button"
              disabled={disabled || !moved}
              onClick={() => onPick(choice)}
              aria-pressed={isSelected}
              className={`btn-chunky rounded-2xl border-2 px-2 py-5 transition disabled:opacity-40 md:py-6 ${
                isSelected
                  ? "border-sky bg-sky-soft"
                  : "border-ink/10 bg-white hover:border-sky/60"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <ChoicePicture choice={choice} selected={isSelected} />
              <div className="mt-2 font-fredoka text-sm font-bold leading-tight text-ink md:text-base">
                {labelForChoice(choice)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SameCountBadge({ count }: { count: number }) {
  return (
    <div
      className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-mint-soft px-3 py-2"
      aria-label={`Misma cantidad: ${count}`}
    >
      {Array.from({ length: Math.min(count, 6) }).map((_, index) => (
        <span key={index} className="h-2.5 w-2.5 rounded-full bg-mint" />
      ))}
    </div>
  );
}

function ChoicePicture({
  choice,
  selected,
}: {
  choice: ConservationChoice;
  selected: boolean;
}) {
  if (choice === "más") {
    return (
      <div className="flex min-h-16 items-center justify-center gap-2" aria-hidden>
        <DotGroup count={1} tone={selected ? "sky" : "mute"} />
        <Plus className="h-5 w-5 text-mint" strokeWidth={3} />
        <DotGroup count={3} tone="mint" />
      </div>
    );
  }

  if (choice === "menos") {
    return (
      <div className="flex min-h-16 items-center justify-center gap-2" aria-hidden>
        <DotGroup count={3} tone={selected ? "sky" : "mute"} />
        <Minus className="h-5 w-5 text-pink" strokeWidth={3} />
        <DotGroup count={1} tone="pink" />
      </div>
    );
  }

  return (
    <div className="flex min-h-16 items-center justify-center gap-2" aria-hidden>
      <DotGroup count={2} tone={selected ? "sky" : "mint"} />
      <Equal className="h-5 w-5 text-sky" strokeWidth={3} />
      <DotGroup count={2} tone={selected ? "sky" : "mint"} />
    </div>
  );
}

function DotGroup({
  count,
  tone,
}: {
  count: number;
  tone: "mint" | "mute" | "pink" | "sky";
}) {
  const color =
    tone === "mint"
      ? "bg-mint"
      : tone === "pink"
        ? "bg-pink"
        : tone === "sky"
          ? "bg-sky"
          : "bg-ink/20";

  return (
    <div className="grid grid-cols-2 gap-1">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={`h-3 w-3 rounded-full ${color} md:h-4 md:w-4`} />
      ))}
    </div>
  );
}

const fallbackPosition: Position = { x: 50, y: 50, rotate: 0, scale: 1 };

function safeLayout(value: string): LayoutName {
  if (
    value === "circle" ||
    value === "close" ||
    value === "compact" ||
    value === "row" ||
    value === "spread"
  ) {
    return value;
  }

  return "spread";
}

function positionsForLayout(layout: LayoutName, count: number): Position[] {
  const total = Math.max(1, count);

  if (layout === "row") {
    return Array.from({ length: total }, (_, index) => ({
      x: evenX(index, total, 18, 82),
      y: 52,
      rotate: 0,
      scale: 1,
    }));
  }

  if (layout === "close" || layout === "compact") {
    const offsets = [
      [-12, -7],
      [0, -8],
      [12, -6],
      [-6, 8],
      [8, 9],
      [0, 3],
    ];
    return Array.from({ length: total }, (_, index) => {
      const [x, y] = offsets[index % offsets.length];
      return {
        x: 50 + x,
        y: 51 + y,
        rotate: index % 2 === 0 ? -5 : 5,
        scale: 1,
      };
    });
  }

  if (layout === "circle") {
    return Array.from({ length: total }, (_, index) => {
      const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
      return {
        x: 50 + Math.cos(angle) * 26,
        y: 51 + Math.sin(angle) * 28,
        rotate: index % 2 === 0 ? -4 : 4,
        scale: 1,
      };
    });
  }

  return spreadPositions(total);
}

function evenX(index: number, total: number, min: number, max: number) {
  if (total <= 1) return 50;
  return min + (index / (total - 1)) * (max - min);
}

function spreadPositions(total: number): Position[] {
  const presets: Position[] = [
    { x: 22, y: 34, rotate: -10, scale: 1 },
    { x: 78, y: 38, rotate: 9, scale: 1 },
    { x: 31, y: 70, rotate: 8, scale: 1 },
    { x: 84, y: 68, rotate: -7, scale: 1 },
    { x: 52, y: 27, rotate: 5, scale: 1 },
    { x: 58, y: 75, rotate: -5, scale: 1 },
  ];

  if (total <= presets.length) {
    return presets.slice(0, total);
  }

  return Array.from({ length: total }, (_, index) => {
    const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
    return {
      x: 50 + Math.cos(angle) * 34,
      y: 52 + Math.sin(angle) * 32,
      rotate: index % 2 === 0 ? -8 : 8,
      scale: 1,
    };
  });
}

function mixPositions(total: number): Position[] {
  const offsets = [
    [0, -9],
    [8, 0],
    [0, 9],
    [-8, 0],
    [7, -7],
    [-7, 7],
  ];

  return Array.from({ length: Math.max(1, total) }, (_, index) => {
    const [x, y] = offsets[index % offsets.length];
    return {
      x: 50 + x,
      y: 52 + y,
      rotate: index % 2 === 0 ? 18 : -18,
      scale: 0.92,
    };
  });
}

function labelForChoice(choice: ConservationChoice) {
  if (choice === "más") return "Más";
  if (choice === "menos") return "Menos";
  return "Igual";
}
