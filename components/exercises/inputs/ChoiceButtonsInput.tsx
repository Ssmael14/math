"use client";
// components/exercises/inputs/ChoiceButtonsInput.tsx
// Grilla de 2-3 botones grandes con label + value para los kinds que tienen
// respuesta categórica corta (COMPARE: <, >, =;  PARITY: par/impar).

export type Choice<V> = { value: V; label: string; sub?: string };

export function ChoiceButtonsInput<V extends string>({
  choices,
  disabled = false,
  selected = null,
  onPick,
}: {
  choices: Choice<V>[];
  disabled?: boolean;
  /** Valor elegido pero aún sin comprobar — se resalta en neutro. */
  selected?: V | null;
  onPick: (value: V) => void;
}) {
  return (
    <div
      className="w-full max-w-xl grid gap-3"
      style={{ gridTemplateColumns: `repeat(${choices.length}, minmax(0, 1fr))` }}
    >
      {choices.map((c) => {
        const isSel = selected === c.value;
        return (
          <button
            key={c.value}
            type="button"
            disabled={disabled}
            onClick={() => onPick(c.value)}
            aria-label={c.label + (c.sub ? ` (${c.sub})` : "")}
            aria-pressed={isSel}
            className={`btn-chunky py-5 md:py-6 rounded-2xl border-2 transition-colors disabled:opacity-50 ${
              isSel
                ? "bg-sky-soft border-sky"
                : "bg-white border-ink/10 hover:border-ink/30"
            }`}
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            <div className="font-fredoka text-3xl md:text-5xl font-bold text-ink leading-none">
              {c.label}
            </div>
            {c.sub && (
              <div className="text-[11px] md:text-sm font-bold text-ink-soft mt-1">{c.sub}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
