// components/exercises/ExerciseVisual.tsx
// Visual centrado de un ejercicio. Sin estado: dado el kind+payload renderiza
// la representación gráfica. Si querés agregar un nuevo tipo de ejercicio,
// agregás un case acá y todo el resto (LessonRunner, hints, scoring) ya funciona.
import type { ExerciseDTO } from "./types";
import { countCols, countSizeCls } from "@/lib/visual-layout";

const ITEM_CLS = "text-5xl md:text-7xl";

export function ExerciseVisual({ ex }: { ex: ExerciseDTO }) {
  switch (ex.kind) {
    case "COUNT": {
      const { item, count } = ex.payload as { item: string; count: number };
      // Grilla con cantidad de columnas según el count, así los ítems
      // quedan ordenados (filas parejas) en lugar del flex-wrap-de-suerte.
      // El tamaño del emoji baja para counts altos para que entren en
      // pantallas chicas (375px).
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
    case "DRAG": {
      const { a, b, item } = ex.payload as { a: number; b: number; item: string };
      return (
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <Group n={a} item={item}/>
          <span className="font-fredoka text-4xl md:text-6xl font-bold text-ink">+</span>
          <Group n={b} item={item}/>
        </div>
      );
    }
    case "SUBTRACT": {
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
                  // delay escalonado: el primer item desaparece primero, así
                  // se ve la "salida" en cascada en lugar de todo a la vez.
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
    case "FILL": {
      const { a, result } = ex.payload as { a: number; result: number };
      return (
        <div className="font-fredoka text-5xl md:text-7xl font-bold text-ink">
          {a} + ? = {result}
        </div>
      );
    }
    case "TRACE": {
      const { digit } = ex.payload as { digit: number };
      return (
        <div className="font-fredoka text-[140px] md:text-[220px] font-bold text-sun leading-none">
          {digit}
        </div>
      );
    }
    case "COMPARE": {
      const { left, right } = ex.payload as { left: number; right: number };
      return (
        <div className="flex items-center justify-center gap-4 md:gap-8">
          <NumberCard n={left}/>
          <span className="font-fredoka text-3xl md:text-5xl font-bold text-ink-mute">?</span>
          <NumberCard n={right}/>
        </div>
      );
    }
    case "PARITY": {
      const { value } = ex.payload as { value: number };
      // Mostramos el número grande y, si caben, los puntitos en filas de a dos
      // para sugerir visualmente el concepto de paridad.
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
    case "PATTERN": {
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
    case "NEIGHBOR": {
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
    default:
      return <div className="text-center text-ink-soft italic">Ejercicio en construcción</div>;
  }
}

/** Cuadradito chunky con un número o un slot vacío para los kinds que muestran
 *  números individuales (COMPARE / PATTERN / NEIGHBOR). */
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

function Group({ n, item }: { n: number; item: string }) {
  return (
    <div className="flex gap-1 md:gap-2 flex-wrap justify-center max-w-[200px]">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className={ITEM_CLS}>{item}</span>
      ))}
    </div>
  );
}

