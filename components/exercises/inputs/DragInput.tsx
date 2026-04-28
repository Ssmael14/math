"use client";
// components/exercises/inputs/DragInput.tsx
// Drag-and-drop real para sumas. El niño arrastra ítems desde dos pools (a, b)
// hasta un canasto central; el contador del canasto crece a medida que llegan.
// Cuando aprieta "Listo", se valida `basket.length` contra `a + b`.
//
// Implementado con Pointer Events nativos para cubrir touch + mouse + stylus
// sin librería externa. Si el niño suelta fuera del canasto, el ítem snapea
// de vuelta a su posición original (clearing del transform).

import { useRef, useState } from "react";

type Item = { id: string; emoji: string; group: "a" | "b" };

export function DragInput({
  a,
  b,
  item,
  disabled = false,
  onSubmit,
}: {
  a: number;
  b: number;
  item: string;
  disabled?: boolean;
  onSubmit: (count: number) => void;
}) {
  const [pool, setPool] = useState<Item[]>(() => [
    ...Array.from({ length: a }, (_, i) => ({ id: `a-${i}`, emoji: item, group: "a" as const })),
    ...Array.from({ length: b }, (_, i) => ({ id: `b-${i}`, emoji: item, group: "b" as const })),
  ]);
  const [basket, setBasket] = useState<Item[]>([]);
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const startRef = useRef<{ x: number; y: number; itemId: string } | null>(null);
  const basketRef = useRef<HTMLDivElement>(null);

  function onPointerDown(e: React.PointerEvent, id: string) {
    if (disabled) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, itemId: id };
    setDragging({ id, dx: 0, dy: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!startRef.current) return;
    e.preventDefault();
    setDragging({
      id: startRef.current.itemId,
      dx: e.clientX - startRef.current.x,
      dy: e.clientY - startRef.current.y,
    });
  }

  function onPointerUp(e: React.PointerEvent, id: string) {
    if (!startRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignoramos errores de releasePointerCapture cuando el pointer ya se soltó.
    }

    const rect = basketRef.current?.getBoundingClientRect();
    const overBasket =
      rect !== undefined &&
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom;

    if (overBasket) {
      const moved = pool.find((p) => p.id === id);
      if (moved) {
        setPool((cur) => cur.filter((p) => p.id !== id));
        setBasket((cur) => [...cur, moved]);
      }
    }

    setDragging(null);
    startRef.current = null;
  }

  function returnFromBasket(id: string) {
    if (disabled) return;
    const moved = basket.find((it) => it.id === id);
    if (!moved) return;
    setBasket((cur) => cur.filter((it) => it.id !== id));
    setPool((cur) => [...cur, moved]);
  }

  const groupA = pool.filter((p) => p.group === "a");
  const groupB = pool.filter((p) => p.group === "b");
  const allMoved = pool.length === 0;

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-4 select-none">
      {/* Pools (arriba) */}
      <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <Pool items={groupA} dragging={dragging} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}/>
        <span className="font-fredoka text-3xl md:text-5xl font-bold text-ink" aria-hidden>+</span>
        <Pool items={groupB} dragging={dragging} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}/>
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest">ARRASTRÁ AL CANASTO</div>

      {/* Canasto */}
      <div
        ref={basketRef}
        role="region"
        aria-label={`Canasto: ${basket.length} ítems`}
        className="w-full min-h-[120px] rounded-3xl border-4 border-dashed border-mint/60 bg-mint-soft/40 p-3 relative"
      >
        <div className="absolute top-2 right-3 font-fredoka text-2xl font-bold text-mint" aria-hidden>
          {basket.length}
        </div>
        <div className="flex flex-wrap gap-2 items-center justify-center min-h-[80px] pt-4">
          {basket.length === 0 ? (
            <span className="text-ink-mute text-sm font-bold">🧺 vacío</span>
          ) : (
            basket.map((it) => (
              <button
                key={it.id}
                type="button"
                disabled={disabled}
                onClick={() => returnFromBasket(it.id)}
                aria-label={`${it.emoji} (tocá para devolver)`}
                className="text-3xl md:text-4xl drag-pop"
              >
                {it.emoji}
              </button>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || basket.length === 0}
        onClick={() => onSubmit(basket.length)}
        className={`btn-chunky w-full py-3 px-6 rounded-full font-black uppercase tracking-wide text-sm transition-colors ${
          basket.length === 0
            ? "bg-ink-mute/20 text-ink-mute"
            : allMoved
              ? "bg-mint text-white"
              : "bg-sun text-ink"
        }`}
        style={{ boxShadow: basket.length === 0 ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        {basket.length === 0
          ? "Movés items al canasto"
          : allMoved
            ? `¡Listo! Hay ${basket.length}`
            : `Confirmar (${basket.length})`}
      </button>
    </div>
  );
}

function Pool({
  items,
  dragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  items: Item[];
  dragging: { id: string; dx: number; dy: number } | null;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent, id: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-1 min-h-[60px]">
      {items.length === 0 ? (
        <span className="text-ink-mute text-xs font-bold py-3">vacío</span>
      ) : (
        items.map((it) => {
          const drag = dragging?.id === it.id ? dragging : null;
          const transform = drag ? `translate(${drag.dx}px, ${drag.dy}px)` : "translate(0, 0)";
          return (
            <span
              key={it.id}
              role="button"
              aria-label={`Arrastrar ${it.emoji}`}
              onPointerDown={(e) => onPointerDown(e, it.id)}
              onPointerMove={onPointerMove}
              onPointerUp={(e) => onPointerUp(e, it.id)}
              onPointerCancel={(e) => onPointerUp(e, it.id)}
              className="text-3xl md:text-4xl cursor-grab active:cursor-grabbing"
              style={{
                touchAction: "none",
                transform,
                transition: drag ? "none" : "transform 200ms ease-out",
                zIndex: drag ? 30 : 1,
                position: "relative",
              }}
            >
              {it.emoji}
            </span>
          );
        })
      )}
    </div>
  );
}
