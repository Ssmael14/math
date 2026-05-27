"use client";

import { useState } from "react";

export function PartWholeInput({
  total,
  item,
  disabled = false,
  onComplete,
}: {
  total: number;
  item: string;
  disabled?: boolean;
  onComplete: (response: { parts: number[] }) => void;
}) {
  const [left, setLeft] = useState<string[]>([]);
  const [right, setRight] = useState<string[]>([]);

  const pool = Array.from({ length: total }, (_, i) => `item-${i}`).filter(
    (id) => !left.includes(id) && !right.includes(id),
  );
  const complete = pool.length === 0 && left.length > 0 && right.length > 0;

  function move(id: string, side: "left" | "right") {
    if (disabled) return;
    setLeft((cur) => cur.filter((v) => v !== id));
    setRight((cur) => cur.filter((v) => v !== id));
    if (side === "left") setLeft((cur) => [...cur, id]);
    else setRight((cur) => [...cur, id]);
  }

  function remove(id: string) {
    if (disabled) return;
    setLeft((cur) => cur.filter((v) => v !== id));
    setRight((cur) => cur.filter((v) => v !== id));
  }

  return (
    <div className="w-full max-w-lg flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <PartBox label="Parte 1" ids={left} item={item} disabled={disabled} onRemove={remove} />
        <PartBox label="Parte 2" ids={right} item={item} disabled={disabled} onRemove={remove} />
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest text-center">
        TOCÁ UN OBJETO Y ELEGÍ UNA PARTE
      </div>

      <div className="flex flex-wrap justify-center gap-2 min-h-16">
        {pool.map((id) => (
          <div key={id} className="flex items-center gap-1">
            <span className="text-3xl leading-none">{item}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => move(id, "left")}
              className="w-8 h-8 rounded-full bg-sky-soft text-ink font-black"
              aria-label="Mover a parte 1"
            >
              1
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => move(id, "right")}
              className="w-8 h-8 rounded-full bg-mint-soft text-ink font-black"
              aria-label="Mover a parte 2"
            >
              2
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={disabled || !complete}
        onClick={() => onComplete({ parts: [left.length, right.length] })}
        className={`btn-chunky w-full py-3 px-6 rounded-full font-black uppercase tracking-wide text-sm ${
          complete ? "bg-mint text-white" : "bg-ink-mute/20 text-ink-mute"
        }`}
        style={{ boxShadow: complete ? "0 4px 0 rgba(0,0,0,0.2)" : undefined }}
      >
        Listo: {left.length} y {right.length}
      </button>
    </div>
  );
}

function PartBox({
  label,
  ids,
  item,
  disabled,
  onRemove,
}: {
  label: string;
  ids: string[];
  item: string;
  disabled: boolean;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="min-h-32 rounded-3xl border-4 border-dashed border-mint/60 bg-mint-soft/40 p-3">
      <div className="font-black text-xs text-ink-soft mb-2">{label}</div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {ids.map((id) => (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => onRemove(id)}
            className="text-3xl leading-none"
            aria-label="Devolver objeto"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
