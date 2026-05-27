"use client";

import { useMemo, useState } from "react";

type SortItem = { id: string; emoji: string; label?: string };
type SortCategory = { id: string; label: string; emoji?: string };

export function SortAttributeInput({
  items,
  categories,
  disabled = false,
  onComplete,
}: {
  items: SortItem[];
  categories: SortCategory[];
  disabled?: boolean;
  onComplete: (response: { groups: Record<string, string[]> }) => void;
}) {
  const [groups, setGroups] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, []])),
  );
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const placed = useMemo(() => new Set(Object.values(groups).flat()), [groups]);
  const complete = placed.size === items.length;

  function chooseCategory(categoryId: string) {
    if (disabled || !selectedItem) return;
    setGroups((current) => {
      const next = Object.fromEntries(
        Object.entries(current).map(([key, ids]) => [key, ids.filter((id) => id !== selectedItem)]),
      ) as Record<string, string[]>;
      next[categoryId] = [...(next[categoryId] ?? []), selectedItem];
      return next;
    });
    setSelectedItem(null);
  }

  function submit() {
    if (!complete || disabled) return;
    onComplete({ groups });
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            disabled={disabled || !selectedItem}
            onClick={() => chooseCategory(category.id)}
            className="min-h-32 rounded-3xl border-4 border-dashed border-mint/60 bg-mint-soft/40 p-3"
          >
            <div className="font-black text-xs text-ink-soft mb-2">
              {category.emoji ? `${category.emoji} ` : ""}{category.label}
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              {(groups[category.id] ?? []).map((id) => {
                const item = items.find((it) => it.id === id);
                return item ? <span key={id} className="text-3xl leading-none">{item.emoji}</span> : null;
              })}
            </div>
          </button>
        ))}
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest text-center">
        TOCÁ UN OBJETO Y DESPUÉS SU CANASTA
      </div>

      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const isPlaced = placed.has(item.id);
          const selected = selectedItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled || isPlaced}
              onClick={() => setSelectedItem(item.id)}
              aria-pressed={selected}
              className={`btn-chunky min-h-20 rounded-2xl border-2 transition-colors ${
                isPlaced ? "bg-cream border-ink/10 opacity-40"
                : selected ? "bg-sky-soft border-sky"
                : "bg-white border-ink/10"
              }`}
              style={{ boxShadow: isPlaced ? "none" : "var(--shadow-chunky-sm)" }}
            >
              <div className="text-3xl leading-none">{item.emoji}</div>
              {item.label && <div className="text-[10px] font-black text-ink-soft">{item.label}</div>}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={disabled || !complete}
        onClick={submit}
        className={`btn-chunky w-full py-3 px-6 rounded-full font-black uppercase tracking-wide text-sm ${
          complete ? "bg-mint text-white" : "bg-ink-mute/20 text-ink-mute"
        }`}
        style={{ boxShadow: complete ? "0 4px 0 rgba(0,0,0,0.2)" : undefined }}
      >
        Listo
      </button>
    </div>
  );
}
