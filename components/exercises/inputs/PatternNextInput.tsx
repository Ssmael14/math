"use client";

import { useRef, useState, type PointerEvent } from "react";

type DraggingPiece = { value: string; x: number; y: number };
type DragStart = { moved: boolean; value: string; x: number; y: number };

export function PatternNextInput({
  answer,
  disabled = false,
  onPick,
  options,
  selected = null,
  sequence,
}: {
  answer: string;
  disabled?: boolean;
  onPick: (value: string) => void;
  options: string[];
  selected?: string | null;
  sequence: string[];
}) {
  const [dragging, setDragging] = useState<DraggingPiece | null>(null);
  const [hoverSlot, setHoverSlot] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [wrongDrops, setWrongDrops] = useState(0);
  const slotRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<DragStart | null>(null);

  function isInsideSlot(x: number, y: number) {
    const slot = slotRef.current;
    if (!slot) return false;
    const rect = slot.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  }

  function tryPlace(value: string) {
    if (value === answer) {
      onPick(value);
      return;
    }

    setWrongDrops((count) => count + 1);
    setRejected(true);
    window.setTimeout(() => setRejected(false), 420);
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    value: string,
  ) {
    if (disabled || selected !== null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      moved: false,
      value,
      x: event.clientX,
      y: event.clientY,
    };
    setDragging({ value, x: event.clientX, y: event.clientY });
    setHoverSlot(false);
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || selected !== null) return;
    const distance = Math.hypot(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y,
    );
    dragStart.moved = dragStart.moved || distance > 6;
    setDragging({ value: dragStart.value, x: event.clientX, y: event.clientY });
    setHoverSlot(isInsideSlot(event.clientX, event.clientY));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || selected !== null) return;

    if (isInsideSlot(event.clientX, event.clientY)) {
      tryPlace(dragStart.value);
    } else if (!dragStart.moved) {
      tryPlace(dragStart.value);
    }

    dragStartRef.current = null;
    setDragging(null);
    setHoverSlot(false);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <div className="w-full rounded-[2rem] bg-cream/60 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {sequence.map((item, index) => (
            <PatternToken key={`${item}-${index}`} value={item} />
          ))}
          <div
            ref={slotRef}
            className={`flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-dashed bg-white transition md:h-24 md:w-24 ${
              selected
                ? "border-mint bg-mint-soft"
                : rejected
                  ? "animate-wrong-shake border-pink bg-peach-soft"
                  : hoverSlot
                    ? "scale-105 border-sky bg-sky-soft"
                  : "border-sky/70"
            }`}
            aria-label="Espacio del patrón"
          >
            {selected ? (
              <span className="text-4xl leading-none md:text-6xl">{selected}</span>
            ) : (
              <span className="font-fredoka text-4xl font-bold text-sky/45">?</span>
            )}
          </div>
        </div>

        <PatternHelp answer={answer} sequence={sequence} wrongDrops={wrongDrops} />
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute md:text-xs">
        Arrastra la pieza que sigue al espacio
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled || selected !== null}
            onPointerDown={(event) => handlePointerDown(event, option)}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`btn-chunky flex h-18 touch-none items-center justify-center rounded-3xl border-2 bg-white text-4xl leading-none transition md:h-22 md:text-5xl ${
              dragging?.value === option
                ? "scale-95 border-sky bg-sky-soft opacity-35"
                : "border-ink/10 hover:border-sky/60"
            }`}
            style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            aria-label={`Pieza ${option}`}
          >
            {option}
          </button>
        ))}
      </div>

      {dragging && (
        <div
          className="pointer-events-none fixed z-50 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border-4 border-white bg-white text-5xl leading-none shadow-[0_18px_40px_rgba(16,32,66,0.22)]"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden
        >
          {dragging.value}
        </div>
      )}
    </div>
  );
}

function PatternHelp({
  answer,
  sequence,
  wrongDrops,
}: {
  answer: string;
  sequence: string[];
  wrongDrops: number;
}) {
  if (wrongDrops === 0) return null;

  const unit = detectRepeatingUnit(sequence);
  if (unit.length === 0 || unit.length >= sequence.length) {
    return null;
  }

  const groups: string[][] = [];
  for (let i = 0; i < sequence.length; i += unit.length) {
    groups.push(sequence.slice(i, i + unit.length));
  }

  return (
    <div className="mt-4 rounded-[1.5rem] border-2 border-dashed border-sky/30 bg-white/75 px-3 py-3">
      <div className="mb-2 text-center text-[10px] font-black uppercase tracking-widest text-sky">
        Mira el grupo que se repite
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex items-end gap-1 rounded-2xl bg-sky-soft/70 px-2 py-2"
          >
            {group.map((item, itemIndex) => (
              <div
                key={`${groupIndex}-${itemIndex}`}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-lg leading-none md:text-xl">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-sky/60" />
              </div>
            ))}
          </div>
        ))}
        {wrongDrops >= 2 && (
          <div className="flex items-end gap-1 rounded-2xl border-2 border-mint bg-mint-soft px-2 py-2">
            {unit.map((item, itemIndex) => (
              <div key={`hint-${itemIndex}`} className="flex flex-col items-center gap-1">
                <span className="text-lg leading-none md:text-xl">{item}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-mint" />
              </div>
            ))}
            <div className="ml-1 flex h-8 w-8 items-center justify-center rounded-xl border-2 border-dashed border-mint bg-white text-xl leading-none">
              {answer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PatternToken({ value }: { value: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-white bg-white text-4xl leading-none shadow-[var(--shadow-chunky-sm)] md:h-20 md:w-20 md:text-5xl">
      {value}
    </div>
  );
}

function detectRepeatingUnit(sequence: string[]) {
  for (let size = 1; size <= Math.floor(sequence.length / 2); size += 1) {
    const unit = sequence.slice(0, size);
    let matches = true;
    for (let i = 0; i < sequence.length; i += 1) {
      if (sequence[i] !== unit[i % size]) {
        matches = false;
        break;
      }
    }
    if (matches) return unit;
  }

  return [];
}
