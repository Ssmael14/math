"use client";

import { useRef, useState, type PointerEvent } from "react";

type DraggingNumber = { value: number; x: number; y: number };
type DragStart = { moved: boolean; value: number; x: number; y: number };

export function OrderInput({
  numbers,
  disabled = false,
  onComplete,
}: {
  numbers: number[];
  disabled?: boolean;
  onComplete: (sequence: number[]) => void;
}) {
  const correctSequence = [...numbers].sort((a, b) => a - b);
  const [placed, setPlaced] = useState<number[]>([]);
  const [dragging, setDragging] = useState<DraggingNumber | null>(null);
  const [hoverPodium, setHoverPodium] = useState(false);
  const [rejectedValue, setRejectedValue] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const podiumRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);

  const complete = placed.length === correctSequence.length;
  const nextExpected = correctSequence[placed.length];
  const compact = correctSequence.length > 3;

  function isInsidePodium(x: number, y: number) {
    const podium = podiumRef.current;
    if (!podium) return false;
    const rect = podium.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function reject(value: number) {
    setWrongCount((count) => count + 1);
    setRejectedValue(value);
    window.setTimeout(() => setRejectedValue(null), 420);
  }

  function tryPlace(value: number) {
    if (disabled || complete || placed.includes(value)) return;

    if (value !== nextExpected) {
      reject(value);
      return;
    }

    const next = [...placed, value];
    setPlaced(next);
    if (next.length === correctSequence.length) {
      onComplete(next);
    }
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    value: number,
  ) {
    if (disabled || complete || placed.includes(value)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      moved: false,
      value,
      x: event.clientX,
      y: event.clientY,
    };
    setDragging({ value, x: event.clientX, y: event.clientY });
    setHoverPodium(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || complete) return;
    const distance = Math.hypot(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y,
    );
    dragStart.moved = dragStart.moved || distance > 6;
    setDragging({ value: dragStart.value, x: event.clientX, y: event.clientY });
    setHoverPodium(isInsidePodium(event.clientX, event.clientY));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || complete) return;

    if (isInsidePodium(event.clientX, event.clientY)) {
      tryPlace(dragStart.value);
    } else if (!dragStart.moved) {
      tryPlace(dragStart.value);
    }

    dragStartRef.current = null;
    setDragging(null);
    setHoverPodium(false);
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <div className="w-full rounded-[2rem] bg-sky-soft/45 p-4 md:p-5">
        <div
          ref={podiumRef}
          className={`rounded-[1.75rem] border-4 border-dashed p-3 transition md:p-4 ${
            hoverPodium
              ? "scale-[1.01] border-sky bg-white"
              : "border-sky/35 bg-white/80"
          }`}
          aria-label="Podio de numeros"
        >
          <div
            className="grid items-end gap-2"
            style={{
              gridTemplateColumns: `repeat(${correctSequence.length}, minmax(0, 1fr))`,
            }}
          >
            {correctSequence.map((expected, index) => {
              const value = placed[index];
              const active = index === placed.length && !complete;
              const hinted = active && wrongCount > 0;

              return (
                <PodiumSlot
                  key={`${expected}-${index}`}
                  active={active}
                  compact={compact}
                  hinted={hinted}
                  index={index}
                  total={correctSequence.length}
                  value={value}
                  expected={expected}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute md:text-xs">
        Arrastra cada número a su lugar
      </div>

      <div className="grid w-full max-w-sm grid-cols-3 gap-3">
        {numbers.map((n) => {
          const taken = placed.includes(n);
          const rejected = rejectedValue === n;

          return (
            <button
              key={n}
              type="button"
              disabled={disabled || complete || taken}
              onPointerDown={(event) => handlePointerDown(event, n)}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              aria-label={`Numero ${n}${taken ? " colocado" : ""}`}
              aria-pressed={taken}
              className={`btn-chunky flex h-20 touch-none items-center justify-center rounded-[1.7rem] border-2 font-fredoka text-4xl font-bold leading-none transition md:h-24 md:text-5xl ${
                taken
                  ? "border-ink/10 bg-cream text-ink-mute opacity-30 shadow-none"
                  : rejected
                    ? "animate-wrong-shake border-pink bg-peach-soft text-ink"
                    : dragging?.value === n
                      ? "scale-95 border-sky bg-sky-soft opacity-35"
                      : "border-ink/10 bg-white text-ink hover:border-sky/60"
              }`}
              style={{ boxShadow: taken ? "none" : "var(--shadow-chunky-sm)" }}
            >
              {n}
            </button>
          );
        })}
      </div>

      {wrongCount > 0 && !complete && (
        <div className="rounded-2xl bg-mint-soft px-4 py-2 text-center font-fredoka text-base font-bold text-ink">
          Busca el {nextExpected}
        </div>
      )}

      {dragging && (
        <div
          className="pointer-events-none fixed z-50 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.7rem] border-4 border-white bg-white font-fredoka text-5xl font-bold leading-none text-ink shadow-[0_18px_40px_rgba(16,32,66,0.22)]"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden
        >
          {dragging.value}
        </div>
      )}
    </div>
  );
}

function PodiumSlot({
  active,
  compact,
  expected,
  hinted,
  index,
  total,
  value,
}: {
  active: boolean;
  compact: boolean;
  expected: number;
  hinted: boolean;
  index: number;
  total: number;
  value?: number;
}) {
  const height = compact
    ? 84 + index * 8
    : [90, 116, 142][index] ?? 90 + index * 14;
  const showValue = value ?? (hinted ? expected : null);

  return (
    <div className="flex min-w-0 flex-col items-center justify-end gap-2">
      <div
        className={`relative flex w-full min-w-0 items-center justify-center rounded-[1.5rem] border-2 transition ${
          value !== undefined
            ? "border-mint bg-mint-soft text-ink shadow-[0_6px_0_rgba(37,180,105,0.22)]"
            : active
              ? "border-sky bg-white text-sky shadow-[0_6px_0_rgba(72,103,245,0.16)]"
              : "border-ink/10 bg-white/60 text-ink-mute"
        } ${hinted ? "animate-pulse" : ""}`}
        style={{ height }}
        aria-label={`Lugar ${index + 1} de ${total}: ${value ?? "vacio"}`}
      >
        {active && (
          <span className="absolute -top-2 h-4 w-9 rounded-b-full bg-[#34c759]" />
        )}
        <span className="font-fredoka text-4xl font-bold leading-none md:text-5xl">
          {showValue ?? "?"}
        </span>
      </div>
      <div className="flex h-5 items-center gap-1">
        {Array.from({ length: Math.min(index + 1, 5) }).map((_, dotIndex) => (
          <span
            key={dotIndex}
            className={`h-2 w-2 rounded-full ${
              active || value !== undefined ? "bg-sky" : "bg-ink/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
