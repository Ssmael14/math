"use client";

type CompareCard = {
  emoji: string;
  label?: string;
  size?: number;
};

type CompareChoice = "izquierda" | "derecha" | "igual";

export function CompareAttributeInput({
  choices,
  disabled = false,
  left,
  onPick,
  right,
  selected = null,
}: {
  choices: CompareChoice[];
  disabled?: boolean;
  left: CompareCard;
  onPick: (value: CompareChoice) => void;
  right: CompareCard;
  selected?: CompareChoice | null;
}) {
  const showEqual = choices.includes("igual");

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <div className="grid w-full grid-cols-2 items-end gap-3 md:gap-5">
        <ObjectButton
          card={left}
          disabled={disabled}
          selected={selected === "izquierda"}
          side="izquierda"
          onPick={onPick}
        />
        <ObjectButton
          card={right}
          disabled={disabled}
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
          aria-pressed={selected === "igual"}
          className={`btn-chunky min-h-16 w-full rounded-2xl border-2 px-4 py-3 transition-colors ${
            selected === "igual"
              ? "border-sky bg-sky-soft"
              : "border-ink/10 bg-white hover:border-ink/30"
          }`}
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl leading-none" aria-hidden>
              {left.emoji}
            </span>
            <span className="font-fredoka text-xl font-bold text-ink">
              Iguales
            </span>
            <span className="text-2xl leading-none" aria-hidden>
              {right.emoji}
            </span>
          </div>
        </button>
      )}
    </div>
  );
}

function ObjectButton({
  card,
  disabled,
  onPick,
  selected,
  side,
}: {
  card: CompareCard;
  disabled: boolean;
  onPick: (value: CompareChoice) => void;
  selected: boolean;
  side: "izquierda" | "derecha";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onPick(side)}
      aria-label={`${side}: ${card.label ?? card.emoji}`}
      aria-pressed={selected}
      className={`btn-chunky flex min-h-44 flex-col items-center justify-end rounded-[2rem] border-2 bg-white px-4 pb-4 pt-5 transition-colors md:min-h-52 ${
        selected ? "border-sky bg-sky-soft" : "border-ink/10 hover:border-sky/60"
      }`}
      style={{ boxShadow: "var(--shadow-chunky)" }}
    >
      <span
        className="leading-none"
        style={{ fontSize: `${Math.round(50 + (card.size ?? 1) * 22)}px` }}
        aria-hidden
      >
        {card.emoji}
      </span>
      {card.label && (
        <span className="mt-3 rounded-full bg-cream px-3 py-1 text-xs font-black text-ink-soft">
          {card.label}
        </span>
      )}
    </button>
  );
}
