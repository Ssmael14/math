"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";

type SortItem = {
  id: string;
  emoji: string;
  label?: string;
  category?: string;
  size?: number;
};
type SortCategory = { id: string; label: string; emoji?: string };
type DraggingItem = { itemId: string; x: number; y: number };
type DragStart = { itemId: string; moved: boolean; x: number; y: number };

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
  const [dragging, setDragging] = useState<DraggingItem | null>(null);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);
  const [lastPlaced, setLastPlaced] = useState<string | null>(null);
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dragStartRef = useRef<DragStart | null>(null);

  const placed = useMemo(() => new Set(Object.values(groups).flat()), [groups]);
  const complete = placed.size === items.length;
  const draggingItem = dragging
    ? items.find((item) => item.id === dragging.itemId)
    : null;

  function placeItem(itemId: string, categoryId: string) {
    setGroups((current) => {
      const next = Object.fromEntries(
        Object.entries(current).map(([key, ids]) => [
          key,
          ids.filter((id) => id !== itemId),
        ]),
      ) as Record<string, string[]>;
      next[categoryId] = [...(next[categoryId] ?? []), itemId];
      return next;
    });
    setSelectedItem(null);
    setLastPlaced(`${categoryId}:${itemId}:${Date.now()}`);
  }

  function chooseCategory(categoryId: string) {
    if (disabled || !selectedItem) return;
    placeItem(selectedItem, categoryId);
  }

  function categoryAtPoint(x: number, y: number) {
    for (const [categoryId, node] of Object.entries(categoryRefs.current)) {
      if (!node) continue;
      const rect = node.getBoundingClientRect();
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return categoryId;
      }
    }

    return null;
  }

  function handleItemPointerDown(
    event: PointerEvent<HTMLButtonElement>,
    itemId: string,
  ) {
    if (disabled || placed.has(itemId)) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      itemId,
      moved: false,
      x: event.clientX,
      y: event.clientY,
    };
    setDragging({ itemId, x: event.clientX, y: event.clientY });
    setSelectedItem(itemId);
  }

  function handleItemPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled) return;

    const distance = Math.hypot(
      event.clientX - dragStart.x,
      event.clientY - dragStart.y,
    );
    dragStart.moved = dragStart.moved || distance > 6;
    setDragging({ itemId: dragStart.itemId, x: event.clientX, y: event.clientY });
    setHoverCategory(categoryAtPoint(event.clientX, event.clientY));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const dragStart = dragStartRef.current;
    if (!dragStart || disabled) return;

    const targetCategory = categoryAtPoint(event.clientX, event.clientY);
    if (targetCategory) {
      placeItem(dragStart.itemId, targetCategory);
    } else if (!dragStart.moved) {
      setSelectedItem((current) =>
        current === dragStart.itemId ? null : dragStart.itemId,
      );
    }

    dragStartRef.current = null;
    setDragging(null);
    setHoverCategory(null);
  }

  function submit() {
    if (!complete || disabled) return;
    onComplete({ groups });
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            ref={(node) => {
              categoryRefs.current[category.id] = node;
            }}
            type="button"
            disabled={disabled}
            onClick={() => chooseCategory(category.id)}
            aria-label={`Canasta ${category.label}`}
            className={`relative min-h-36 overflow-hidden rounded-[2rem] border-4 p-3 transition ${
              hoverCategory === category.id || selectedItem
                ? "border-sky bg-sky-soft/70 shadow-[0_6px_0_rgba(72,103,245,0.18)]"
                : "border-dashed border-mint/60 bg-mint-soft/40"
            }`}
          >
            <div
              className={`absolute left-1/2 top-0 h-5 w-20 -translate-x-1/2 rounded-b-2xl ${
                hoverCategory === category.id ? "bg-sky" : "bg-mint"
              }`}
              aria-hidden
            />
            <div className="mb-3 mt-2 flex flex-col items-center justify-center gap-1">
              <CategoryCue category={category} />
              <span className="text-center text-xs font-black text-ink-soft">
                {category.label}
              </span>
            </div>
            <div className="flex min-h-16 flex-wrap items-center justify-center gap-1.5">
              {(groups[category.id] ?? []).map((id) => {
                const item = items.find((it) => it.id === id);
                const placedKey = `${category.id}:${id}`;
                return item ? (
                  <span
                    key={id}
                    className={`inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-white/80 p-1 leading-none shadow-[var(--shadow-chunky-sm)] ${
                      lastPlaced?.startsWith(`${placedKey}:`) ? "drag-pop" : ""
                    }`}
                    style={{ fontSize: emojiSize(item, 34) }}
                  >
                    {item.emoji}
                  </span>
                ) : null;
              })}
            </div>
          </button>
        ))}
      </div>

      <div className="text-[10px] font-black text-ink-mute tracking-widest text-center">
        ARRASTRA CADA OBJETO A SU CANASTA
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
              onPointerDown={(event) => handleItemPointerDown(event, item.id)}
              onPointerMove={handleItemPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              aria-pressed={selected}
              className={`btn-chunky min-h-24 touch-none rounded-2xl border-2 transition ${
                isPlaced ? "bg-cream border-ink/10 opacity-40"
                : dragging?.itemId === item.id ? "scale-95 bg-sky-soft border-sky opacity-35"
                : selected ? "bg-sky-soft border-sky"
                : "bg-white border-ink/10"
              }`}
              style={{ boxShadow: isPlaced ? "none" : "var(--shadow-chunky-sm)" }}
            >
              <div
                className="leading-none"
                style={{ fontSize: emojiSize(item, 38) }}
              >
                {item.emoji}
              </div>
              {item.label && <div className="text-[10px] font-black text-ink-soft">{item.label}</div>}
            </button>
          );
        })}
      </div>

      {dragging && draggingItem && (
        <div
          className="pointer-events-none fixed z-50 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.5rem] border-4 border-white bg-white shadow-[0_18px_40px_rgba(16,32,66,0.22)]"
          style={{ left: dragging.x, top: dragging.y }}
          aria-hidden
        >
          <span
            className="leading-none"
            style={{ fontSize: emojiSize(draggingItem, 54) }}
          >
            {draggingItem.emoji}
          </span>
        </div>
      )}

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

function emojiSize(item: SortItem, basePx: number) {
  return `${Math.round(basePx * sortItemScale(item))}px`;
}

function sortItemScale(item: SortItem) {
  if (typeof item.size === "number" && Number.isFinite(item.size)) {
    if (item.size <= 1.6) return clamp(item.size, 0.72, 1.45);
    return clamp(0.75 + item.size * 0.16, 0.72, 1.45);
  }

  const marker = `${item.id} ${item.label ?? ""} ${item.category ?? ""}`.toLowerCase();
  if (/(small|pequeñ|chic|mini)/.test(marker)) return 0.7;
  if (/(big|grande|large|alto)/.test(marker)) return 1.28;
  return 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function CategoryCue({ category }: { category: SortCategory }) {
  const scale = categoryCueScale(category);
  const cue = category.emoji ?? categoryCueEmoji(category);

  return (
    <div
      className="flex h-16 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-[var(--shadow-chunky-sm)]"
      aria-hidden
    >
      <span
        className="leading-none"
        style={{
          color: categoryCueColor(category),
          fontSize: `${Math.round(36 * scale)}px`,
        }}
      >
        {cue}
      </span>
    </div>
  );
}

function categoryCueEmoji(category: SortCategory) {
  const marker = `${category.id} ${category.label}`.toLowerCase();
  if (/(fruta|fruit|roja|amarilla|verde)/.test(marker)) return "🍎";
  if (/(animal)/.test(marker)) return "🐱";
  if (/(círculo|circulo|circle)/.test(marker)) return "●";
  if (/(triángulo|triangulo|triangle)/.test(marker)) return "▲";
  if (/(cuadrado|square)/.test(marker)) return "■";
  return "⭐";
}

function categoryCueScale(category: SortCategory) {
  const marker = `${category.id} ${category.label}`.toLowerCase();
  if (/(small|pequeñ|chic|mini)/.test(marker)) return 0.68;
  if (/(big|grande|large|alto)/.test(marker)) return 1.38;
  return 1;
}

function categoryCueColor(category: SortCategory) {
  if (category.emoji) return undefined;

  const marker = `${category.id} ${category.label}`.toLowerCase();
  if (/(círculo|circulo|circle)/.test(marker)) return "#4867f5";
  if (/(triángulo|triangulo|triangle)/.test(marker)) return "#ff5a78";
  if (/(cuadrado|square)/.test(marker)) return "#34c759";
  return undefined;
}
