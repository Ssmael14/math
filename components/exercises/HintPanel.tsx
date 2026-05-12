// components/exercises/HintPanel.tsx
// Panel que aparece bajo el visual cuando el niño se equivocó.
// La política de qué mostrar está en lib/hints.ts — este componente sólo
// renderiza el resultado.
import type { HintLevel } from "@/lib/learning/hints";

export function HintPanel({
  level,
  hint,
  explanation,
  answer,
}: {
  level: HintLevel;
  hint: string | null;
  explanation: string | null;
  answer: number | string | null;
}) {
  if (level === "none") return null;

  if (level === "hint") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="w-full max-w-xl bg-sun-soft border-2 border-sun rounded-2xl p-4 flex items-start gap-3"
        style={{ boxShadow: "var(--shadow-chunky-sm)" }}
      >
        <span className="text-3xl shrink-0" aria-hidden>💡</span>
        <div>
          <div className="font-fredoka font-bold text-ink text-sm md:text-base">Pista</div>
          <p className="text-ink-soft text-sm md:text-base mt-0.5">
            {hint ?? "Mirá el ejercicio con calma y contá despacio."}
          </p>
        </div>
      </div>
    );
  }

  // level === "solution"
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-xl bg-sky-soft border-2 border-sky rounded-2xl p-4 flex items-start gap-3"
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      <span className="text-3xl shrink-0" aria-hidden>📖</span>
      <div className="flex-1">
        <div className="font-fredoka font-bold text-ink text-sm md:text-base">
          {answer !== null ? `La respuesta es ${answer}` : "Mirá la explicación"}
        </div>
        <p className="text-ink-soft text-sm md:text-base mt-0.5">
          {explanation ?? "No te preocupes — vas a ir mejorando con la práctica. ¡Seguimos!"}
        </p>
      </div>
    </div>
  );
}
