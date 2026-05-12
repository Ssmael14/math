// components/exercises/ExerciseVisual.tsx
// Visual del ejercicio. NO depende del `kind` (que es la interacción), sino
// de `payload.visual` — un hint del seeder/generator sobre qué dibujar.
//
// Esto permite que dos exercises con el mismo kind (MULTIPLE_CHOICE) tengan
// visuales totalmente distintos: uno cuenta estrellas, otro compara números,
// otro pregunta paridad. El motor sigue siendo el mismo.
import type { ExerciseDTO } from "./types";
import { countCols, countSizeCls } from "@/lib/learning/visual-layout";

const ITEM_CLS = "text-5xl md:text-7xl";

export function ExerciseVisual({ ex }: { ex: ExerciseDTO }) {
  const visual = typeof ex.payload.visual === "string" ? ex.payload.visual : null;

  switch (visual) {
    case "count": {
      const { item, count } = ex.payload as { item: string; count: number };
      const cols = countCols(count);
      const sizeCls = countSizeCls(count);
      return (
        <div
          className="grid justify-center gap-2 md:gap-3 max-w-lg mx-auto"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, auto))` }}
        >
          {Array.from({ length: count }).map((_, idx) => (
            <span key={idx} className={`${sizeCls} leading-none`}>{item}</span>
          ))}
        </div>
      );
    }

    case "subtract": {
      const { total, removed, item } = ex.payload as { total: number; removed: number; item: string };
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-lg">
            {Array.from({ length: total }).map((_, i) => {
              const isRemoved = i < removed;
              return (
                <span
                  key={i}
                  className={`${ITEM_CLS} relative inline-block ${isRemoved ? "subtract-removed" : ""}`}
                  style={isRemoved ? { animationDelay: `${i * 120}ms` } : undefined}
                  aria-hidden={isRemoved}
                >
                  {item}
                </span>
              );
            })}
          </div>
          <div className="text-xs md:text-sm font-bold text-ink-soft">
            <span className="text-pink">−{removed}</span>{" "}
            <span aria-hidden>{item.repeat(Math.min(removed, 3))}</span>
            {removed > 3 ? "…" : ""}
          </div>
        </div>
      );
    }

    case "fill": {
      const { a, result } = ex.payload as { a: number; result: number };
      return (
        <div className="font-fredoka text-5xl md:text-7xl font-bold text-ink">
          {a} + ? = {result}
        </div>
      );
    }

    case "compare": {
      const { left, right } = ex.payload as { left: number; right: number };
      return (
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <NumberCard n={left}/>
          <span className="font-fredoka text-3xl md:text-5xl font-bold text-ink-mute">?</span>
          <NumberCard n={right}/>
        </div>
      );
    }

    case "parity": {
      const { value } = ex.payload as { value: number };
      const dots = Math.min(value, 10);
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="font-fredoka text-[120px] md:text-[180px] font-bold text-sky leading-none">
            {value}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Array.from({ length: dots }).map((_, i) => (
              <span key={i} className="text-2xl" aria-hidden>•</span>
            ))}
          </div>
        </div>
      );
    }

    case "pattern": {
      const { visible, step } = ex.payload as { visible: number[]; step: number };
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3">
            {visible.map((n, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3">
                <NumberCard n={n}/>
                <span className="font-fredoka text-2xl md:text-3xl font-bold text-ink-mute" aria-hidden>→</span>
              </div>
            ))}
            <NumberCard placeholder/>
          </div>
          <div className="text-[10px] font-bold text-ink-mute tracking-widest mt-1">
            VAN DE A {step}
          </div>
        </div>
      );
    }

    case "neighbor": {
      const { value, direction } = ex.payload as { value: number; direction: "before" | "after" };
      return (
        <div className="flex items-center justify-center gap-3 md:gap-4">
          {direction === "before" ? (
            <>
              <NumberCard placeholder/>
              <span className="font-fredoka text-2xl md:text-3xl font-bold text-ink-mute" aria-hidden>→</span>
              <NumberCard n={value}/>
            </>
          ) : (
            <>
              <NumberCard n={value}/>
              <span className="font-fredoka text-2xl md:text-3xl font-bold text-ink-mute" aria-hidden>→</span>
              <NumberCard placeholder/>
            </>
          )}
        </div>
      );
    }

    case "drag": {
      // El visual real lo dibuja DragInput. Acá no mostramos nada extra.
      return null;
    }

    case "draw": {
      // Idem TraceCanvas.
      return null;
    }

    default:
      // Fallback genérico: si no hay visual definido, mostramos el prompt
      // como visual mismo. Útil para audio/speak en el futuro.
      return null;
  }
}

function NumberCard({ n, placeholder = false }: { n?: number; placeholder?: boolean }) {
  return (
    <div
      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 flex items-center justify-center font-fredoka text-3xl md:text-4xl font-bold ${
        placeholder
          ? "border-dashed border-ink/20 bg-cream text-ink-mute"
          : "border-white bg-sun-soft text-ink"
      }`}
      style={{ boxShadow: placeholder ? "none" : "var(--shadow-chunky-sm)" }}
    >
      {placeholder ? "?" : n}
    </div>
  );
}
