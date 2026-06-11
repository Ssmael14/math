"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";

type FitAttribute = "size" | "height" | "length";
type OrderObject = { id: string; emoji: string; label?: string; size?: number };
type DraggingObject = { id: string; x: number; y: number };
type DragStart = { id: string; moved: boolean; x: number; y: number };

export function ObjectOrderInput({
  attribute,
  objects,
  disabled = false,
  onComplete,
}: {
  attribute?: string;
  objects: OrderObject[];
  disabled?: boolean;
  onComplete: (sequence: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const fitAttribute = toFitAttribute(attribute);

  if (fitAttribute && objects.length > 0) {
    return (
      <FitOrderInput
        attribute={fitAttribute}
        objects={objects}
        disabled={disabled}
        onComplete={onComplete}
      />
    );
  }

  function toggle(id: string) {
    if (disabled) return;
    setPicked((current) => {
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      if (next.length === objects.length) onComplete(next);
      return next;
    });
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div
        className="grid w-full gap-2"
        style={{ gridTemplateColumns: `repeat(${objects.length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: objects.length }).map((_, i) => {
          const object = objects.find((candidate) => candidate.id === picked[i]);
          return (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-ink/10 bg-white/60"
            >
              {object ? (
                <ObjectCard object={object} compact />
              ) : (
                <span className="font-fredoka text-2xl font-bold text-ink-mute">
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-black uppercase tracking-widest text-ink-mute">
        TOCA EN ORDEN
      </div>

      <div className="grid w-full grid-cols-3 gap-2 md:grid-cols-5">
        {objects.map((object) => {
          const taken = picked.includes(object.id);
          return (
            <button
              key={object.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(object.id)}
              aria-pressed={taken}
              className={`btn-chunky rounded-2xl border-2 py-3 transition-colors ${
                taken ? "border-ink/10 bg-cream opacity-50" : "border-ink/10 bg-white"
              }`}
              style={{ boxShadow: taken ? "none" : "var(--shadow-chunky-sm)" }}
            >
              <ObjectCard object={object} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FitOrderInput({
  attribute,
  disabled,
  objects,
  onComplete,
}: {
  attribute: FitAttribute;
  disabled: boolean;
  objects: OrderObject[];
  onComplete: (sequence: string[]) => void;
}) {
  const slots = useMemo(
    () => [...objects].sort((a, b) => (a.size ?? 1) - (b.size ?? 1)),
    [objects],
  );
  const [placed, setPlaced] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(slots.map((slot) => [slot.id, null])),
  );
  const [dragging, setDragging] = useState<DraggingObject | null>(null);
  const [rejectedSlot, setRejectedSlot] = useState<string | null>(null);
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStartRef = useRef<DragStart | null>(null);

  const placedIds = useMemo(
    () => new Set(Object.values(placed).filter(Boolean) as string[]),
    [placed],
  );
  const draggingObject = dragging
    ? objects.find((object) => object.id === dragging.id)
    : null;

  function slotAtPoint(x: number, y: number) {
    for (const [slotId, node] of Object.entries(slotRefs.current)) {
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return slotId;
      }
    }
    return null;
  }

  function placeExact(objectId: string, slotId: string) {
    if (objectId !== slotId) {
      setRejectedSlot(slotId);
      window.setTimeout(() => setRejectedSlot(null), 380);
      return;
    }

    setPlaced((current) => {
      const next = Object.fromEntries(
        Object.entries(current).map(([id, value]) => [
          id,
          value === objectId ? null : value,
        ]),
      ) as Record<string, string | null>;
      next[slotId] = objectId;

      if (Object.values(next).every(Boolean)) {
        onComplete(slots.map((slot) => next[slot.id]).filter(Boolean) as string[]);
      }

      return next;
    });
  }

  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    objectId: string,
  ) {
    if (disabled || placedIds.has(objectId)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      id: objectId,
      moved: false,
      x: event.clientX,
      y: event.clientY,
    };
    setDragging({ id: objectId, x: event.clientX, y: event.clientY });
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled) return;
    const distance = Math.hypot(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y,
    );
    dragStart.moved = dragStart.moved || distance > 6;
    setDragging({ id: dragStart.id, x: event.clientX, y: event.clientY });
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled) return;

    const targetSlot = slotAtPoint(event.clientX, event.clientY);
    if (targetSlot) {
      placeExact(dragStart.id, targetSlot);
    } else if (!dragStart.moved) {
      placeExact(dragStart.id, dragStart.id);
    }

    dragStartRef.current = null;
    setDragging(null);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-5">
      <div className="w-full overflow-x-auto pb-1 no-scrollbar">
        <div className="mx-auto flex min-w-max items-end justify-center gap-4 px-1 md:gap-7">
          {slots.map((slot) => {
            const placedObject = placed[slot.id]
              ? objects.find((object) => object.id === placed[slot.id])
              : null;
            return (
              <FitSlot
                key={slot.id}
                attribute={attribute}
                object={placedObject ?? slot}
                refCallback={(node) => {
                  slotRefs.current[slot.id] = node;
                }}
                rejected={rejectedSlot === slot.id}
                filled={Boolean(placedObject)}
              />
            );
          })}
        </div>
      </div>

      <div className="text-center text-[10px] font-black uppercase tracking-widest text-ink-mute">
        {instructionFor(attribute)}
      </div>

      <div className="w-full overflow-x-auto pb-1 no-scrollbar">
        <div className="mx-auto flex min-h-40 min-w-max items-end justify-center gap-4 px-1 md:gap-7">
          {objects.map((object) => {
            const taken = placedIds.has(object.id);
            return (
              <button
                key={object.id}
                type="button"
                disabled={disabled || taken}
                onPointerDown={(event) => handlePointerDown(event, object.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className={`btn-chunky touch-none rounded-3xl border-2 bg-white px-3 py-3 transition ${
                  taken
                    ? "border-ink/10 opacity-30"
                    : dragging?.id === object.id
                      ? "scale-95 border-sky bg-sky-soft opacity-30"
                      : "border-ink/10 hover:border-sky/60"
                }`}
                style={{ boxShadow: taken ? "none" : "var(--shadow-chunky-sm)" }}
                aria-label={object.label ?? object.id}
              >
                <FitShape attribute={attribute} object={object} />
              </button>
            );
          })}
        </div>
      </div>

      {dragging && draggingObject && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden
        >
          <div className="rounded-3xl bg-white p-2 shadow-[0_18px_40px_rgba(16,32,66,0.22)]">
            <FitShape attribute={attribute} object={draggingObject} />
          </div>
        </div>
      )}
    </div>
  );
}

function FitSlot({
  attribute,
  filled,
  object,
  refCallback,
  rejected,
}: {
  attribute: FitAttribute;
  filled: boolean;
  object: OrderObject;
  refCallback: (node: HTMLDivElement | null) => void;
  rejected: boolean;
}) {
  const dims = fitDimensions(attribute, object);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-end justify-center"
        style={{ height: slotStageHeight(attribute), width: Math.max(dims.width, 58) }}
      >
        <div
          ref={refCallback}
          className={`flex items-center justify-center border-4 border-dashed bg-sky-soft/45 transition ${
            attribute === "size" ? "rounded-full" : "rounded-2xl"
          } ${
            rejected
              ? "animate-wrong-shake border-pink bg-peach-soft"
              : filled
                ? "border-mint bg-mint-soft"
                : "border-sky/70"
          }`}
          style={{ height: dims.height, width: dims.width }}
          aria-label={`Casillero ${object.label ?? object.id}`}
        >
          {filled ? (
            <FitShape attribute={attribute} object={object} compact />
          ) : (
            <EmptyFitHint attribute={attribute} />
          )}
        </div>
      </div>
      <div className="text-center text-[10px] font-black text-ink-soft">
        {object.label ?? labelFor(attribute, object)}
      </div>
    </div>
  );
}

function FitShape({
  attribute,
  compact = false,
  object,
}: {
  attribute: FitAttribute;
  compact?: boolean;
  object: OrderObject;
}) {
  const dims = fitDimensions(attribute, object);
  const scale = compact ? 0.72 : 1;
  const width = dims.width * scale;
  const height = dims.height * scale;

  return (
    <div className="flex flex-col items-center justify-end gap-1">
      <span
        className={`border-4 border-white bg-sky shadow-[var(--shadow-chunky-sm)] ${
          attribute === "size" ? "rounded-full" : "rounded-full"
        }`}
        style={{ height, width }}
        aria-hidden
      />
      {object.label && !compact && (
        <span className="text-[10px] font-black text-ink-soft">
          {object.label}
        </span>
      )}
    </div>
  );
}

function EmptyFitHint({ attribute }: { attribute: FitAttribute }) {
  if (attribute === "size") {
    return <div className="h-[38%] w-[38%] rounded-full bg-white/70" />;
  }
  if (attribute === "height") {
    return <div className="h-[52%] w-3 rounded-full bg-white/70" />;
  }
  return <div className="h-3 w-[52%] rounded-full bg-white/70" />;
}

function ObjectCard({ object, compact = false }: { object: OrderObject; compact?: boolean }) {
  const size = object.size ?? 1;
  const fontSize = compact ? 22 + size * 7 : 24 + size * 9;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <span className="leading-none" style={{ fontSize }}>{object.emoji}</span>
      {object.label && !compact && (
        <span className="text-[10px] font-black text-ink-soft">
          {object.label}
        </span>
      )}
    </div>
  );
}

function fitDimensions(attribute: FitAttribute, object: OrderObject) {
  const size = object.size ?? 1;
  if (attribute === "size") {
    const diameter = size <= 1 ? 48 : size <= 2 ? 80 : size <= 3 ? 116 : Math.min(136, 68 + size * 16);
    return { height: diameter, width: diameter };
  }
  if (attribute === "height") {
    return { height: Math.min(142, 32 + size * 22), width: 38 };
  }
  return { height: 38, width: Math.min(132, 42 + size * 18) };
}

function slotStageHeight(attribute: FitAttribute) {
  if (attribute === "height") return 154;
  if (attribute === "length") return 70;
  return 126;
}

function instructionFor(attribute: FitAttribute) {
  if (attribute === "size") return "Arrastra cada circulo al casillero que encaja";
  if (attribute === "height") return "Arrastra cada palito al casillero que encaja";
  return "Arrastra cada barra al casillero que encaja";
}

function labelFor(attribute: FitAttribute, object: OrderObject) {
  const size = object.size ?? 1;
  if (attribute === "height") {
    if (size <= 1) return "bajo";
    if (size <= 2) return "medio";
    if (size <= 3) return "alto";
    return "muy alto";
  }
  if (attribute === "length") {
    if (size <= 1) return "corto";
    if (size <= 3) return "medio";
    return "largo";
  }
  if (size <= 1) return "pequeno";
  if (size <= 2) return "mediano";
  return "grande";
}

function toFitAttribute(attribute?: string): FitAttribute | null {
  if (attribute === "size" || attribute === "height" || attribute === "length") {
    return attribute;
  }
  return null;
}
