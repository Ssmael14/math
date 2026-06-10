"use client";

import { useMemo, useState } from "react";

export function BaseTenInput({
  target,
  disabled = false,
  onSubmit,
}: {
  target: number;
  disabled?: boolean;
  onSubmit: (value: number) => void;
}) {
  const [tens, setTens] = useState(0);
  const [ones, setOnes] = useState(0);
  const value = tens * 10 + ones;
  const maxTens = Math.max(9, Math.ceil(target / 10));

  function addTen() {
    if (disabled) return;
    setTens((current) => Math.min(maxTens, current + 1));
  }

  function addOne() {
    if (disabled) return;
    setOnes((current) => Math.min(9, current + 1));
  }

  function removeTen() {
    if (disabled) return;
    setTens((current) => Math.max(0, current - 1));
  }

  function removeOne() {
    if (disabled) return;
    setOnes((current) => Math.max(0, current - 1));
  }

  function clear() {
    if (disabled) return;
    setTens(0);
    setOnes(0);
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="text-center">
        <div className="text-[10px] font-black uppercase tracking-widest text-ink-mute">
          FORMA EL NÚMERO
        </div>
        <div className="font-fredoka text-5xl font-bold text-sky">{target}</div>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <PlaceValueBox label="Decenas" count={tens} type="ten" onRemove={removeTen} disabled={disabled} />
        <PlaceValueBox label="Unidades" count={ones} type="one" onRemove={removeOne} disabled={disabled} />
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled || tens >= maxTens}
          onClick={addTen}
          className="btn-chunky rounded-2xl bg-sky-soft px-4 py-4 font-black text-sky"
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          + 1 decena
        </button>
        <button
          type="button"
          disabled={disabled || ones >= 9}
          onClick={addOne}
          className="btn-chunky rounded-2xl bg-sun-soft px-4 py-4 font-black text-ink"
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          + 1 unidad
        </button>
      </div>

      <div className="flex w-full items-center gap-3">
        <button
          type="button"
          disabled={disabled || value === 0}
          onClick={clear}
          className="rounded-full bg-cream px-4 py-3 text-sm font-black text-ink-soft"
        >
          Borrar
        </button>
        <div className="ml-auto font-fredoka text-2xl font-bold text-ink">
          {tens}D + {ones}U = {value}
        </div>
      </div>

      <button
        type="button"
        disabled={disabled || value === 0}
        onClick={() => onSubmit(value)}
        className={`btn-chunky w-full rounded-full px-6 py-3 text-sm font-black uppercase tracking-wide ${
          value === 0 ? "bg-ink-mute/20 text-ink-mute" : "bg-mint text-white"
        }`}
        style={{ boxShadow: value === 0 ? undefined : "0 4px 0 rgba(0,0,0,0.2)" }}
      >
        Listo: {value}
      </button>
    </div>
  );
}

function PlaceValueBox({
  label,
  count,
  type,
  disabled,
  onRemove,
}: {
  label: string;
  count: number;
  type: "ten" | "one";
  disabled: boolean;
  onRemove: () => void;
}) {
  const blocks = useMemo(() => Array.from({ length: count }), [count]);

  return (
    <div className="min-h-44 rounded-3xl border-4 border-dashed border-sky/35 bg-sky-soft/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-black uppercase tracking-widest text-ink-soft">{label}</div>
        <button
          type="button"
          disabled={disabled || count === 0}
          onClick={onRemove}
          className="h-8 w-8 rounded-full bg-white font-black text-ink-soft shadow-[var(--shadow-chunky-sm)]"
          aria-label={`Quitar ${label}`}
        >
          −
        </button>
      </div>
      <div className="flex min-h-28 flex-wrap content-start justify-center gap-2">
        {blocks.length === 0 ? (
          <span className="self-center text-sm font-bold text-ink-mute">vacío</span>
        ) : type === "ten" ? (
          blocks.map((_, i) => <TenBlock key={i} />)
        ) : (
          blocks.map((_, i) => <span key={i} className="h-6 w-6 rounded-full bg-sun shadow-[var(--shadow-chunky-sm)]" />)
        )}
      </div>
    </div>
  );
}

function TenBlock() {
  return (
    <div className="grid grid-cols-2 gap-0.5 rounded-xl bg-white p-1.5 shadow-[var(--shadow-chunky-sm)]">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className="h-2.5 w-2.5 rounded-full bg-sky" />
      ))}
    </div>
  );
}
