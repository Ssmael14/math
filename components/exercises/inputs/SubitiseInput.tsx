"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw } from "lucide-react";

export function SubitiseInput({
  arrangement = "dice",
  count,
  disabled = false,
  durationMs = 1200,
  item,
  options,
  selected = null,
  onPick,
}: {
  arrangement?: string;
  count: number;
  disabled?: boolean;
  durationMs?: number;
  item: string;
  options: number[];
  selected?: number | null;
  onPick: (value: number) => void;
}) {
  const [visible, setVisible] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const safeOptions = useMemo(
    () => [...new Set(options)].filter((value) => Number.isFinite(value) && value > 0),
    [options],
  );

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [count, durationMs, replayKey]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="w-full rounded-[2rem] bg-sky-soft/45 p-4 md:p-5">
        <div className="relative mx-auto flex h-48 w-full max-w-md items-center justify-center overflow-hidden rounded-[1.75rem] border-4 border-sky/25 bg-white md:h-56">
          {visible ? (
            <QuantityScene
              arrangement={arrangement}
              count={count}
              item={item}
              large
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-cream text-sky shadow-[var(--shadow-chunky-sm)]">
              <Eye className="h-12 w-12" strokeWidth={2.8} aria-hidden />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || visible}
          onClick={() => setReplayKey((value) => value + 1)}
          className="btn-chunky mx-auto mt-4 flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-2xl border-2 border-sky bg-white px-5 font-fredoka text-base font-bold text-ink disabled:opacity-45"
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
          Ver otra vez
        </button>
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute">
        Elige la tarjeta que viste
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3 md:grid-cols-4">
        {safeOptions.map((option) => {
          const picked = selected === option;
          return (
            <button
              key={option}
              type="button"
              disabled={disabled || visible}
              onClick={() => onPick(option)}
              aria-label={`Cantidad ${option}`}
              aria-pressed={picked}
              className={`btn-chunky flex min-h-28 items-center justify-center rounded-[1.5rem] border-2 p-2 transition disabled:opacity-45 md:min-h-32 ${
                picked
                  ? "border-sky bg-sky-soft"
                  : "border-ink/10 bg-white hover:border-sky/60"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <QuantityScene
                arrangement={arrangementForOption(option)}
                count={option}
                item={item}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuantityScene({
  arrangement,
  count,
  item,
  large = false,
}: {
  arrangement: string;
  count: number;
  item: string;
  large?: boolean;
}) {
  const positions = positionsForArrangement(arrangement, count);
  const sizeClass = large
    ? count <= 4
      ? "text-5xl md:text-6xl"
      : "text-4xl md:text-5xl"
    : count <= 4
      ? "text-3xl md:text-4xl"
      : "text-2xl md:text-3xl";

  return (
    <div className={`relative ${large ? "h-36 w-56 md:h-40 md:w-64" : "h-20 w-28 md:h-24 md:w-32"}`} aria-hidden>
      {positions.map((position, index) => (
        <span
          key={index}
          className={`absolute -translate-x-1/2 -translate-y-1/2 leading-none ${sizeClass}`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function arrangementForOption(count: number) {
  if (count === 2) return "pair";
  if (count === 3) return "triangle";
  if (count === 4) return "square";
  if (count === 5) return "dice";
  return "spread";
}

function positionsForArrangement(arrangement: string, count: number) {
  const safeCount = Math.max(0, Math.min(count, 10));

  if (safeCount === 1) return [{ x: 50, y: 50 }];
  if (arrangement === "pair" || safeCount === 2) {
    return [
      { x: 35, y: 50 },
      { x: 65, y: 50 },
    ].slice(0, safeCount);
  }
  if (arrangement === "triangle" || safeCount === 3) {
    return [
      { x: 50, y: 28 },
      { x: 34, y: 68 },
      { x: 66, y: 68 },
    ].slice(0, safeCount);
  }
  if (arrangement === "square" || safeCount === 4) {
    return [
      { x: 34, y: 32 },
      { x: 66, y: 32 },
      { x: 34, y: 68 },
      { x: 66, y: 68 },
    ].slice(0, safeCount);
  }
  if (arrangement === "dice" || safeCount === 5) {
    return [
      { x: 30, y: 30 },
      { x: 70, y: 30 },
      { x: 50, y: 50 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
    ].slice(0, safeCount);
  }

  const presets = [
    { x: 24, y: 30 },
    { x: 50, y: 26 },
    { x: 76, y: 30 },
    { x: 34, y: 52 },
    { x: 66, y: 52 },
    { x: 24, y: 74 },
    { x: 50, y: 78 },
    { x: 76, y: 74 },
    { x: 18, y: 52 },
    { x: 82, y: 52 },
  ];
  return presets.slice(0, safeCount);
}
