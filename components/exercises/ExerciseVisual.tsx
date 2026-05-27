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

    case "same-match": {
      const { left = [], right = [] } = ex.payload as {
        left?: { emoji: string }[];
        right?: { emoji: string }[];
      };
      return (
        <div className="flex items-center justify-center gap-4 text-3xl md:text-4xl">
          <EmojiStrip items={left.map((i) => i.emoji)} />
          <span className="font-fredoka font-bold text-ink-mute">↔</span>
          <EmojiStrip items={right.map((i) => i.emoji)} />
        </div>
      );
    }

    case "sort-attribute": {
      const { items = [], categories = [] } = ex.payload as {
        items?: { emoji: string }[];
        categories?: { label: string; emoji?: string }[];
      };
      return (
        <div className="flex flex-col items-center gap-3">
          <EmojiStrip items={items.map((i) => i.emoji)} />
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c, i) => (
              <span key={i} className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-ink-soft">
                {c.emoji ? `${c.emoji} ` : ""}{c.label}
              </span>
            ))}
          </div>
        </div>
      );
    }

    case "compare-attribute": {
      const { left, right } = ex.payload as {
        left?: { emoji: string; label?: string; size?: number };
        right?: { emoji: string; label?: string; size?: number };
      };
      return (
        <div className="flex items-end justify-center gap-8">
          {left && <ScaledEmoji emoji={left.emoji} label={left.label} size={left.size ?? 1} />}
          {right && <ScaledEmoji emoji={right.emoji} label={right.label} size={right.size ?? 1} />}
        </div>
      );
    }

    case "order-objects": {
      const { objects = [] } = ex.payload as { objects?: { emoji: string; size?: number; label?: string }[] };
      return (
        <div className="flex items-end justify-center gap-3 md:gap-4 flex-wrap">
          {objects.map((object, i) => (
            <ScaledEmoji key={i} emoji={object.emoji} label={object.label} size={object.size ?? 1} />
          ))}
        </div>
      );
    }

    case "pattern-next": {
      const { sequence = [] } = ex.payload as { sequence?: string[] };
      return (
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-3">
          {sequence.map((item, i) => (
            <span key={i} className="text-4xl md:text-6xl leading-none">{item}</span>
          ))}
          <NumberCard placeholder />
        </div>
      );
    }

    case "flash-quantity": {
      const { item, count, arrangement } = ex.payload as { item: string; count: number; arrangement?: string };
      return (
        <div className="flex flex-col items-center gap-2">
          <div className={`grid gap-2 ${arrangement === "dice" ? "grid-cols-3" : count === 4 ? "grid-cols-2" : "grid-cols-3"}`}>
            {Array.from({ length: count }).map((_, i) => (
              <span key={i} className="text-4xl md:text-6xl leading-none">{item}</span>
            ))}
          </div>
          <div className="text-[10px] font-black text-ink-mute tracking-widest">MIRÁ EL GRUPO COMPLETO</div>
        </div>
      );
    }

    case "conservation": {
      const { item, count } = ex.payload as { item: string; count: number };
      return (
        <div className="flex flex-col items-center gap-4">
          <EmojiStrip items={Array.from({ length: count }, () => item)} />
          <EmojiStrip spread items={Array.from({ length: count }, () => item)} />
        </div>
      );
    }

    case "compare-groups": {
      const { left, right } = ex.payload as {
        left?: { item: string; count: number };
        right?: { item: string; count: number };
      };
      return (
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          <GroupBox label="Izquierda" group={left} />
          <GroupBox label="Derecha" group={right} />
        </div>
      );
    }

    case "part-whole": {
      const { item, total } = ex.payload as { item: string; total: number };
      return <EmojiStrip items={Array.from({ length: total }, () => item)} />;
    }

    // -----------------------------------------------------------------
    // READING visuals
    // -----------------------------------------------------------------
    case "letter": {
      // Una letra grande sola. Para "¿qué letra es?" o sound matching.
      const { letter } = ex.payload as { letter: string };
      return (
        <div className="font-fredoka text-[160px] md:text-[240px] font-bold text-pink leading-none">
          {letter}
        </div>
      );
    }

    case "word": {
      // Una palabra grande. Para "¿cuántas letras tiene?" o reconocimiento.
      const { word } = ex.payload as { word: string };
      return (
        <div className="font-fredoka text-6xl md:text-8xl font-bold text-ink tracking-wider">
          {word.toUpperCase()}
        </div>
      );
    }

    case "word-letters": {
      // Una palabra mostrada letra por letra en cards (para conteo/análisis).
      const { word } = ex.payload as { word: string };
      const letters = word.toUpperCase().split("");
      return (
        <div className="flex justify-center gap-2 md:gap-3 flex-wrap max-w-lg">
          {letters.map((l, i) => (
            <div
              key={i}
              className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-pink-soft border-4 border-white flex items-center justify-center font-fredoka text-3xl md:text-5xl font-bold text-pink"
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              {l}
            </div>
          ))}
        </div>
      );
    }

    case "emoji-word": {
      // Un emoji grande (ilustración) + label opcional debajo. Útil para
      // "¿qué palabra describe a esta cosa?".
      const { emoji, label } = ex.payload as { emoji: string; label?: string };
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="text-[120px] md:text-[180px] leading-none">{emoji}</div>
          {label && <div className="font-fredoka text-xl font-bold text-ink-soft">{label}</div>}
        </div>
      );
    }

    default:
      // Fallback genérico: si no hay visual definido, mostramos el prompt
      // como visual mismo. Útil para audio/speak en el futuro.
      return null;
  }
}

function EmojiStrip({ items, spread = false }: { items: string[]; spread?: boolean }) {
  return (
    <div className={`flex flex-wrap justify-center ${spread ? "gap-5 md:gap-8" : "gap-1.5 md:gap-2"} max-w-lg`}>
      {items.map((item, i) => (
        <span key={i} className="text-4xl md:text-6xl leading-none">{item}</span>
      ))}
    </div>
  );
}

function ScaledEmoji({ emoji, label, size }: { emoji: string; label?: string; size: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="leading-none" style={{ fontSize: 30 + size * 16 }}>{emoji}</span>
      {label && <span className="text-[10px] font-black text-ink-soft">{label}</span>}
    </div>
  );
}

function GroupBox({ label, group }: { label: string; group?: { item: string; count: number } }) {
  return (
    <div className="rounded-3xl bg-cream p-3 min-h-32 flex flex-col items-center justify-center gap-2">
      <div className="text-[10px] font-black text-ink-mute tracking-widest">{label}</div>
      <div className="flex flex-wrap justify-center gap-1">
        {Array.from({ length: group?.count ?? 0 }).map((_, i) => (
          <span key={i} className="text-3xl md:text-4xl leading-none">{group?.item}</span>
        ))}
      </div>
    </div>
  );
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
