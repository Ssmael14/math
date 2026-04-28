// components/exercises/ExerciseVisual.tsx
// Visual centrado de un ejercicio. Sin estado: dado el kind+payload renderiza
// la representación gráfica. Si querés agregar un nuevo tipo de ejercicio,
// agregás un case acá y todo el resto (LessonRunner, hints, scoring) ya funciona.
import type { ExerciseDTO } from "./types";

const ITEM_CLS = "text-5xl md:text-7xl";

export function ExerciseVisual({ ex }: { ex: ExerciseDTO }) {
  switch (ex.kind) {
    case "COUNT": {
      const { item, count } = ex.payload as { item: string; count: number };
      return (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-lg">
          {Array.from({ length: count }).map((_, idx) => (
            <span key={idx} className={ITEM_CLS}>{item}</span>
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
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-lg">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`${ITEM_CLS} ${i < removed ? "opacity-20 line-through" : ""}`}>{item}</span>
          ))}
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
    default:
      return <div className="text-center text-ink-soft italic">Ejercicio en construcción</div>;
  }
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
