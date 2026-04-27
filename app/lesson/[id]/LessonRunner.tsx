"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";

type Ex = {
  id: string;
  kind: "DRAG" | "SUBTRACT" | "COUNT" | "MATCH" | "FILL" | "TRACE" | "ORDER" | "SPEED";
  prompt: string;
  payload: any;
  solution: { answer?: number; digit?: number; order?: number[]; pairs?: number[][] };
};

export function LessonRunner({
  childId, hearts, lesson, exercises,
}: {
  childId: string;
  hearts: number;
  lesson: { id: string; title: string; xpReward: number };
  exercises: Ex[];
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [startedAt] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const ex = exercises[i];
  const answer = ex.solution.answer ?? ex.solution.digit ?? 0;

  const state = picked === null ? "idle" : picked === answer ? "correct" : "wrong";

  async function recordAttempt(correct: boolean, response: any) {
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        childId, exerciseId: ex.id, correct, response,
        timeMs: Date.now() - startedAt,
      }),
    }).catch(() => {});
  }

  async function next() {
    if (state === "correct") {
      await recordAttempt(true, { picked });
      const nextCount = correctCount + 1;
      setCorrectCount(nextCount);
      if (i + 1 >= exercises.length) {
        const stars = Math.round((nextCount / exercises.length) * 3);
        await fetch("/api/progress", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ childId, lessonId: lesson.id, stars, score: nextCount }),
        }).catch(() => {});
        router.push(`/victory?xp=${lesson.xpReward}&stars=${stars}`);
      } else {
        setI(i + 1);
        setPicked(null);
      }
    } else {
      await recordAttempt(false, { picked });
      setPicked(null);
    }
  }

  const progress = ((i + (state === "correct" ? 1 : 0)) / exercises.length) * 100;
  const options = genOptions(ex, answer);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* TOP BAR — delgada, full-width, estilo Brilliant */}
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 md:px-6 h-14">
          <button
            onClick={() => router.push("/home")}
            className="w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink text-2xl"
            aria-label="Cerrar"
          >×</button>

          <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
          </div>

          <div className="flex items-center gap-1 text-sm font-black text-pink">
            <span>❤️</span><span>{hearts}</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO — ocupa todo el espacio disponible, centrado */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-16">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="text-[10px] md:text-xs font-black text-ink-mute tracking-widest mb-2">
            EJERCICIO {i + 1} / {exercises.length}
          </div>
          <h2 className="font-fredoka text-xl md:text-3xl font-bold text-ink text-center mb-8 md:mb-12 text-balance">
            {ex.prompt}
          </h2>

          {/* Visual grande y centrado */}
          <div className="w-full flex justify-center mb-8 md:mb-12">
            <Visual ex={ex}/>
          </div>

          {/* Opciones */}
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl">
            {options.map((n) => {
              const isPicked = picked === n;
              return (
                <button
                  key={n}
                  onClick={() => setPicked(n)}
                  disabled={state !== "idle"}
                  className={`btn-chunky py-4 md:py-5 rounded-2xl font-fredoka text-2xl md:text-3xl font-bold border-2 transition-colors ${
                    isPicked
                      ? state === "correct" ? "bg-mint-soft text-ink border-mint"
                      : state === "wrong" ? "bg-peach-soft text-ink border-pink"
                      : "bg-sky-soft border-sky text-ink"
                      : "bg-white border-ink/10 text-ink hover:border-ink/30"
                  }`}
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >{n}</button>
              );
            })}
          </div>
        </div>
      </main>

      {/* BOTTOM BAR — feedback estilo Brilliant */}
      <footer
        className={`border-t transition-colors ${
          state === "correct" ? "bg-mint-soft border-mint/40"
          : state === "wrong" ? "bg-peach-soft border-pink/40"
          : "bg-white border-ink/5"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4">
          {state === "idle" && (
            <>
              <div className="hidden md:flex items-center gap-3 flex-1">
                <Lumi size={48}/>
                <span className="text-sm font-bold text-ink-soft">¡Tú puedes! Elegí tu respuesta.</span>
              </div>
              <button disabled className="w-full md:w-auto md:min-w-[200px] ml-auto py-3 px-6 rounded-full bg-ink-mute/20 text-ink-mute font-black uppercase tracking-wide text-sm">
                Elegí una respuesta
              </button>
            </>
          )}

          {state === "correct" && (
            <>
              <div className="flex items-center gap-2 md:gap-3 flex-1">
                <span className="text-3xl md:text-4xl">🎉</span>
                <div>
                  <div className="font-fredoka text-base md:text-xl font-bold text-mint">¡Correcto!</div>
                  <div className="text-xs md:text-sm font-bold text-ink-soft">+{Math.round(lesson.xpReward / exercises.length)} XP</div>
                </div>
              </div>
              <button onClick={next}
                className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm"
                style={{ boxShadow: "0 4px 0 #4DA86A" }}>
                Continuar
              </button>
            </>
          )}

          {state === "wrong" && (
            <>
              <div className="flex items-center gap-2 md:gap-3 flex-1">
                <span className="text-3xl md:text-4xl">💪</span>
                <div>
                  <div className="font-fredoka text-base md:text-xl font-bold text-pink">Probá de nuevo</div>
                  <div className="text-xs md:text-sm font-bold text-ink-soft">¡Tú puedes!</div>
                </div>
              </div>
              <button onClick={next}
                className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-pink text-white font-black uppercase tracking-wide text-sm"
                style={{ boxShadow: "0 4px 0 #D14A6A" }}>
                Reintentar
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

function genOptions(ex: Ex, answer: number) {
  const base = [answer, answer + 1, Math.max(1, answer - 1), answer + 2];
  return [...new Set(base)].sort(() => Math.random() - 0.5).slice(0, 4);
}

function Visual({ ex }: { ex: Ex }) {
  const cls = "text-5xl md:text-7xl";
  if (ex.kind === "COUNT") {
    const items = Array(ex.payload.count).fill(ex.payload.item);
    return (
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-lg">
        {items.map((it, idx) => <span key={idx} className={cls}>{it}</span>)}
      </div>
    );
  }
  if (ex.kind === "DRAG") {
    return (
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <div className="flex gap-1 md:gap-2 flex-wrap justify-center max-w-[200px]">
          {Array(ex.payload.a).fill(0).map((_, i) => <span key={i} className={cls}>{ex.payload.item}</span>)}
        </div>
        <span className="font-fredoka text-4xl md:text-6xl font-bold text-ink">+</span>
        <div className="flex gap-1 md:gap-2 flex-wrap justify-center max-w-[200px]">
          {Array(ex.payload.b).fill(0).map((_, i) => <span key={i} className={cls}>{ex.payload.item}</span>)}
        </div>
      </div>
    );
  }
  if (ex.kind === "SUBTRACT") {
    const total = ex.payload.total, removed = ex.payload.removed;
    return (
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-lg">
        {Array(total).fill(0).map((_, i) => (
          <span key={i} className={`${cls} ${i < removed ? "opacity-20 line-through" : ""}`}>{ex.payload.item}</span>
        ))}
      </div>
    );
  }
  if (ex.kind === "FILL") {
    return (
      <div className="font-fredoka text-5xl md:text-7xl font-bold text-ink">
        {ex.payload.a} + ? = {ex.payload.result}
      </div>
    );
  }
  if (ex.kind === "TRACE") {
    return <div className="font-fredoka text-[140px] md:text-[220px] font-bold text-sun leading-none">{ex.payload.digit}</div>;
  }
  return <div className="text-center text-ink-soft italic">Ejercicio en construcción</div>;
}
