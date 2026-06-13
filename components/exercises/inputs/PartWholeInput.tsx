"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";

type Side = "left" | "right";
type DraggingItem = { id: string; x: number; y: number };
type DragStart = { id: string; moved: boolean; x: number; y: number };

export function PartWholeInput({
  item,
  parts = [],
  total,
  disabled = false,
  onComplete,
}: {
  item: string;
  parts?: number[];
  total: number;
  disabled?: boolean;
  onComplete: (response: { parts: number[] }) => void;
}) {
  const targetParts = normalizeParts(parts, total);
  const [left, setLeft] = useState<string[]>([]);
  const [right, setRight] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DraggingItem | null>(null);
  const [hoverSide, setHoverSide] = useState<Side | null>(null);
  const [lastPlaced, setLastPlaced] = useState<string | null>(null);
  const sideRefs = useRef<Record<Side, HTMLDivElement | null>>({
    left: null,
    right: null,
  });
  const dragStartRef = useRef<DragStart | null>(null);

  const allIds = useMemo(
    () => Array.from({ length: total }, (_, index) => `item-${index}`),
    [total],
  );
  const placed = useMemo(() => new Set([...left, ...right]), [left, right]);
  const pool = allIds.filter((id) => !placed.has(id));
  const targetReached =
    pool.length === 0 &&
    left.length === targetParts[0] &&
    right.length === targetParts[1];
  const draggingVisible = dragging && !placed.has(dragging.id);

  function placeItem(id: string, side: Side) {
    if (disabled || targetReached) return;
    const nextLeft = side === "left" ? [...left.filter((v) => v !== id), id] : left.filter((v) => v !== id);
    const nextRight = side === "right" ? [...right.filter((v) => v !== id), id] : right.filter((v) => v !== id);

    setLeft(nextLeft);
    setRight(nextRight);
    setSelectedItem(null);
    setLastPlaced(`${side}:${id}:${Date.now()}`);

    if (
      nextLeft.length + nextRight.length === total &&
      nextLeft.length === targetParts[0] &&
      nextRight.length === targetParts[1]
    ) {
      onComplete({ parts: [nextLeft.length, nextRight.length] });
    }
  }

  function returnItem(id: string) {
    if (disabled || targetReached) return;
    setLeft((current) => current.filter((value) => value !== id));
    setRight((current) => current.filter((value) => value !== id));
    setSelectedItem(id);
  }

  function chooseSide(side: Side) {
    if (!selectedItem || disabled || targetReached) return;
    placeItem(selectedItem, side);
  }

  function sideAtPoint(x: number, y: number) {
    for (const [side, node] of Object.entries(sideRefs.current) as Array<[Side, HTMLDivElement | null]>) {
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return side;
      }
    }

    return null;
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    id: string,
  ) {
    if (disabled || targetReached || placed.has(id)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      id,
      moved: false,
      x: event.clientX,
      y: event.clientY,
    };
    setSelectedItem(id);
    setDragging({ id, x: event.clientX, y: event.clientY });
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || targetReached) return;
    const distance = Math.hypot(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y,
    );
    dragStart.moved = dragStart.moved || distance > 6;
    setDragging({ id: dragStart.id, x: event.clientX, y: event.clientY });
    setHoverSide(sideAtPoint(event.clientX, event.clientY));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled || targetReached) return;

    const side = sideAtPoint(event.clientX, event.clientY);
    if (side) {
      placeItem(dragStart.id, side);
    } else if (!dragStart.moved) {
      setSelectedItem((current) => (current === dragStart.id ? null : dragStart.id));
    }

    dragStartRef.current = null;
    setDragging(null);
    setHoverSide(null);
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <PartBox
          ids={left}
          item={item}
          lastPlaced={lastPlaced}
          selectedItem={selectedItem}
          side="left"
          target={targetParts[0]}
          disabled={disabled || targetReached}
          hover={hoverSide === "left"}
          inputRef={(node) => {
            sideRefs.current.left = node;
          }}
          onPickSide={chooseSide}
          onReturn={returnItem}
        />
        <PartBox
          ids={right}
          item={item}
          lastPlaced={lastPlaced}
          selectedItem={selectedItem}
          side="right"
          target={targetParts[1]}
          disabled={disabled || targetReached}
          hover={hoverSide === "right"}
          inputRef={(node) => {
            sideRefs.current.right = node;
          }}
          onPickSide={chooseSide}
          onReturn={returnItem}
        />
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute">
        Arrastra cada objeto a una parte
      </div>

      <div className="grid min-h-28 grid-cols-4 gap-2 rounded-[2rem] bg-cream/60 p-3">
        {pool.map((id) => {
          const selected = selectedItem === id;
          return (
            <button
              key={id}
              type="button"
              disabled={disabled || targetReached}
              onPointerDown={(event) => handlePointerDown(event, id)}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              aria-pressed={selected}
              aria-label="Objeto para separar"
              className={`btn-chunky flex min-h-20 touch-none items-center justify-center rounded-2xl border-2 text-4xl leading-none transition md:text-5xl ${
                selected
                  ? "border-sky bg-sky-soft"
                  : "border-ink/10 bg-white"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div
        className={`min-h-12 rounded-2xl px-4 py-2 text-center font-fredoka text-base font-bold ${
          targetReached ? "bg-mint-soft text-ink" : "bg-sky-soft/50 text-ink-soft"
        }`}
      >
        {targetReached ? "Listo" : "Llena las dos partes"}
      </div>

      {draggingVisible && (
        <div
          className="pointer-events-none fixed z-50 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.5rem] border-4 border-white bg-white text-5xl leading-none shadow-[0_18px_40px_rgba(16,32,66,0.22)]"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden
        >
          {item}
        </div>
      )}
    </div>
  );
}

function PartBox({
  disabled,
  hover,
  ids,
  inputRef,
  item,
  lastPlaced,
  onPickSide,
  onReturn,
  selectedItem,
  side,
  target,
}: {
  disabled: boolean;
  hover: boolean;
  ids: string[];
  inputRef: (node: HTMLDivElement | null) => void;
  item: string;
  lastPlaced: string | null;
  onPickSide: (side: Side) => void;
  onReturn: (id: string) => void;
  selectedItem: string | null;
  side: Side;
  target: number;
}) {
  return (
    <div
      ref={inputRef}
      onClick={() => onPickSide(side)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onPickSide(side);
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`Parte ${side}`}
      className={`relative min-h-44 overflow-hidden rounded-[2rem] border-4 p-3 transition ${
        hover || selectedItem
          ? "border-sky bg-sky-soft/70 shadow-[0_6px_0_rgba(72,103,245,0.18)]"
          : "border-dashed border-mint/60 bg-mint-soft/40"
      }`}
    >
      <div
        className={`absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 rounded-b-2xl ${
          hover ? "bg-sky" : "bg-mint"
        }`}
        aria-hidden
      />
      <TargetDots count={target} />
      <div className="mt-3 flex min-h-24 flex-wrap items-center justify-center gap-1.5">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            className={`inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-white/85 text-3xl leading-none shadow-[var(--shadow-chunky-sm)] md:h-14 md:min-w-14 md:text-4xl ${
              lastPlaced?.startsWith(`${side}:${id}:`) ? "drag-pop" : ""
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onReturn(id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onReturn(id);
              }
            }}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function TargetDots({ count }: { count: number }) {
  return (
    <div className="mx-auto mt-4 grid max-w-24 grid-cols-3 place-items-center gap-1 rounded-2xl bg-white/65 px-2 py-2">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="h-2.5 w-2.5 rounded-full bg-sky md:h-3 md:w-3" />
      ))}
    </div>
  );
}

function normalizeParts(parts: number[], total: number): [number, number] {
  const first = Number.isFinite(parts[0]) ? Math.max(0, Math.floor(parts[0])) : Math.floor(total / 2);
  const second = Number.isFinite(parts[1]) ? Math.max(0, Math.floor(parts[1])) : total - first;
  return [first, second];
}
