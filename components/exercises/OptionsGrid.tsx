// components/exercises/OptionsGrid.tsx
// Grilla de 4 opciones numéricas tipo Brilliant. Los botones reflejan
// el estado externo (idle/correct/wrong) y se deshabilitan tras elegir.

// "selected" = elegido pero todavía sin comprobar (resaltado neutro).
// correct/wrong = ya se tocó "Comprobar".
export type OptionState = "idle" | "selected" | "correct" | "wrong";

export function OptionsGrid({
  options,
  picked,
  state,
  onPick,
}: {
  options: number[];
  picked: number | null;
  state: OptionState;
  onPick: (n: number) => void;
}) {
  // Sólo se bloquea cuando ya hay veredicto. En "selected" el niño puede
  // cambiar de opción antes de Comprobar.
  const locked = state === "correct" || state === "wrong";
  return (
    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl">
      {options.map((n) => {
        const isPicked = picked === n;
        return (
          <button
            key={n}
            onClick={() => onPick(n)}
            disabled={locked}
            aria-label={`Opción ${n}`}
            aria-pressed={isPicked}
            className={`btn-chunky py-4 md:py-5 rounded-2xl font-fredoka text-2xl md:text-3xl font-bold border-2 transition-colors ${
              isPicked
                ? state === "correct" ? "bg-mint-soft text-ink border-mint"
                : state === "wrong" ? "bg-peach-soft text-ink border-pink"
                : "bg-sky-soft border-sky text-ink"
                : "bg-white border-ink/10 text-ink hover:border-ink/30"
            }`}
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
