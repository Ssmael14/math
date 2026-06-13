"use client";

import { Equal } from "lucide-react";

type CompareChoice = "izquierda" | "derecha" | "igual";
type Group = { count: number; item: string };

export function CompareGroupsInput({
  choices,
  disabled = false,
  left,
  right,
  selected = null,
  onPick,
}: {
  choices: CompareChoice[];
  disabled?: boolean;
  left: Group;
  right: Group;
  selected?: CompareChoice | null;
  onPick: (value: CompareChoice) => void;
}) {
  const showEqual = choices.includes("igual");

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="grid w-full grid-cols-2 gap-3 md:gap-5">
        <GroupButton
          disabled={disabled}
          group={left}
          selected={selected === "izquierda"}
          side="izquierda"
          onPick={onPick}
        />
        <GroupButton
          disabled={disabled}
          group={right}
          selected={selected === "derecha"}
          side="derecha"
          onPick={onPick}
        />
      </div>

      {showEqual && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPick("igual")}
          aria-label="Hay igual cantidad"
          aria-pressed={selected === "igual"}
          className={`btn-chunky flex min-h-20 w-full max-w-xs items-center justify-center gap-4 rounded-3xl border-2 px-5 py-3 transition disabled:opacity-50 ${
            selected === "igual"
              ? "border-sky bg-sky-soft"
              : "border-ink/10 bg-white hover:border-sky/60"
          }`}
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          <MiniDotGroup count={2} />
          <Equal className="h-8 w-8 text-sky" strokeWidth={3} aria-hidden />
          <MiniDotGroup count={2} />
        </button>
      )}
    </div>
  );
}

function GroupButton({
  disabled,
  group,
  selected,
  side,
  onPick,
}: {
  disabled: boolean;
  group: Group;
  selected: boolean;
  side: "derecha" | "izquierda";
  onPick: (value: CompareChoice) => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(side)}
      aria-label={`Grupo de la ${side}`}
      aria-pressed={selected}
      className={`btn-chunky min-h-[170px] rounded-[2rem] border-2 p-3 transition disabled:opacity-50 md:min-h-[210px] md:p-4 ${
        selected
          ? "border-sky bg-sky-soft"
          : "border-ink/10 bg-white hover:border-sky/60"
      }`}
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      <div className="flex h-full min-h-[140px] items-center justify-center rounded-[1.5rem] bg-cream/65 p-3 md:min-h-[176px]">
        <GroupDots group={group} />
      </div>
    </button>
  );
}

function GroupDots({ group }: { group: Group }) {
  const count = Math.max(0, Math.min(group.count, 20));
  const columns = count <= 4 ? 2 : count <= 9 ? 3 : 4;
  const sizeClass =
    count <= 4
      ? "text-4xl md:text-6xl"
      : count <= 9
        ? "text-3xl md:text-5xl"
        : "text-2xl md:text-4xl";

  return (
    <div
      className="grid place-items-center gap-1.5 md:gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className={`${sizeClass} leading-none`}>
          {group.item}
        </span>
      ))}
    </div>
  );
}

function MiniDotGroup({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 gap-1" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="h-4 w-4 rounded-full bg-mint md:h-5 md:w-5" />
      ))}
    </div>
  );
}
