"use client";

import { useState } from "react";

type OrderObject = { id: string; emoji: string; label?: string; size?: number };

export function ObjectOrderInput({
  objects,
  disabled = false,
  onComplete,
}: {
  objects: OrderObject[];
  disabled?: boolean;
  onComplete: (sequence: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);

  function toggle(id: string) {
    if (disabled) return;
    setPicked((current) => {
      const next = current.includes(id) ? current.filter((v) => v !== id) : [...current, id];
      if (next.length === objects.length) onComplete(next);
      return next;
    });
  }

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-4">
      <div className="w-full grid gap-2" style={{ gridTemplateColumns: `repeat(${objects.length}, minmax(0, 1fr))` }}>
        {Array.from({ length: objects.length }).map((_, i) => {
          const object = objects.find((o) => o.id === picked[i]);
          return (
            <div
              key={i}
              className="aspect-square rounded-2xl border-2 border-dashed border-ink/10 bg-white/60 flex items-center justify-center"
            >
              {object ? <ObjectCard object={object} compact /> : <span className="font-fredoka text-2xl font-bold text-ink-mute">{i + 1}</span>}
            </div>
          );
        })}
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest">TOCÁ EN ORDEN</div>

      <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-2">
        {objects.map((object) => {
          const taken = picked.includes(object.id);
          return (
            <button
              key={object.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(object.id)}
              aria-pressed={taken}
              className={`btn-chunky py-3 rounded-2xl border-2 transition-colors ${
                taken ? "bg-cream border-ink/10 opacity-50" : "bg-white border-ink/10"
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

function ObjectCard({ object, compact = false }: { object: OrderObject; compact?: boolean }) {
  const size = object.size ?? 1;
  const fontSize = compact ? 22 + size * 7 : 24 + size * 9;
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <span className="leading-none" style={{ fontSize }}>{object.emoji}</span>
      {object.label && !compact && <span className="text-[10px] font-black text-ink-soft">{object.label}</span>}
    </div>
  );
}
