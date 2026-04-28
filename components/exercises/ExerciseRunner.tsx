"use client";
// components/exercises/ExerciseRunner.tsx
// Loop genérico de "una secuencia de ejercicios" — alimenta tanto la lección
// normal (LessonRunner) como el modo Repaso del día (ReviewRunner).
//
// El componente NO sabe qué pasa al terminar — el wrapper recibe el callback
// onComplete({ correctCount, total }) y decide (redirigir a /victory, mostrar
// pantalla de repaso, etc.).

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { ExerciseVisual } from "@/components/exercises/ExerciseVisual";
import { OptionsGrid } from "@/components/exercises/OptionsGrid";
import { HintPanel } from "@/components/exercises/HintPanel";
import type { ExerciseDTO } from "@/components/exercises/types";
import { nextHintLevel, shouldAdvanceAfterWrong, pickHint } from "@/lib/hints";

export type RunnerLabels = {
  /** Texto chico arriba del prompt: "EJERCICIO" / "REPASO" / etc. */
  step: string;
  /** Mensaje del Lumi en estado idle. */
  idle: string;
};

export function ExerciseRunner({
  childId,
  hearts,
  exercises,
  closeHref = "/home",
  xpPerExercise = 0,
  reviewMode = false,
  labels = { step: "EJERCICIO", idle: "¡Tú puedes! Elegí tu respuesta." },
  onComplete,
}: {
  childId: string;
  hearts: number;
  exercises: ExerciseDTO[];
  closeHref?: string;
  xpPerExercise?: number;
  /** Si true, se manda al server reviewMode=true (no descuenta corazones). */
  reviewMode?: boolean;
  labels?: RunnerLabels;
  onComplete: (result: { correctCount: number; total: number }) => void | Promise<void>;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [exerciseStartedAt, setExerciseStartedAt] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);

  const ex = exercises[i];
  const answer = ex.solution.answer ?? ex.solution.digit ?? 0;
  const state = picked === null ? "idle" : picked === answer ? "correct" : "wrong";
  const hintLevel = nextHintLevel(wrongCount);
  const mustAdvance = shouldAdvanceAfterWrong(wrongCount);

  const options = useMemo(() => genOptions(answer), [ex.id, answer]);

  async function recordAttempt(
    correct: boolean,
    response: unknown,
    srs: { final: boolean; priorWrongs: number; solutionShown: boolean },
  ) {
    await fetch("/api/attempts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        childId, exerciseId: ex.id, correct, response,
        timeMs: Date.now() - exerciseStartedAt,
        reviewMode,
        ...srs,
      }),
    }).catch(() => {});
  }

  async function advance(scoreCorrect: boolean) {
    const nextCount = correctCount + (scoreCorrect ? 1 : 0);
    setCorrectCount(nextCount);

    if (i + 1 >= exercises.length) {
      await onComplete({ correctCount: nextCount, total: exercises.length });
      return;
    }

    setI(i + 1);
    setPicked(null);
    setWrongCount(0);
    setExerciseStartedAt(Date.now());
  }

  async function onContinue() {
    if (state === "correct") {
      await recordAttempt(true, { picked }, {
        final: true, priorWrongs: wrongCount, solutionShown: false,
      });
      await advance(true);
      return;
    }

    const next = wrongCount + 1;
    setWrongCount(next);

    if (shouldAdvanceAfterWrong(next)) {
      await recordAttempt(false, { picked }, {
        final: true, priorWrongs: wrongCount, solutionShown: true,
      });
      return;
    }

    await recordAttempt(false, { picked }, {
      final: false, priorWrongs: wrongCount, solutionShown: false,
    });
    setPicked(null);
  }

  async function onAcknowledgeSolution() {
    await advance(false);
  }

  const progress = ((i + (state === "correct" ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 md:px-6 h-14">
          <button
            onClick={() => router.push(closeHref)}
            className="w-8 h-8 flex items-center justify-center text-ink-soft hover:text-ink text-2xl"
            aria-label="Cerrar"
          >×</button>

          <div className="flex-1 h-2.5 bg-cream rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
          </div>

          {reviewMode ? (
            <div className="flex items-center gap-1 text-sm font-black text-lilac" aria-label="Modo repaso">
              <span aria-hidden>🔁</span><span>Repaso</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm font-black text-pink" aria-label={`${hearts} corazones`}>
              <span aria-hidden>❤️</span><span>{hearts}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8 md:py-16">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          <div className="text-[10px] md:text-xs font-black text-ink-mute tracking-widest mb-2">
            {labels.step} {i + 1} / {exercises.length}
          </div>
          <h2 className="font-fredoka text-xl md:text-3xl font-bold text-ink text-center mb-8 md:mb-12 text-balance">
            {ex.prompt}
          </h2>

          <div className="w-full flex justify-center mb-8 md:mb-12">
            <ExerciseVisual ex={ex}/>
          </div>

          <OptionsGrid options={options} picked={picked} state={state} onPick={setPicked}/>

          {hintLevel !== "none" && (
            <div className="w-full mt-6 flex justify-center">
              <HintPanel
                level={hintLevel}
                hint={pickHint(hintLevel, ex.hints ?? null)}
                explanation={ex.explanation ?? null}
                answer={answer}
              />
            </div>
          )}
        </div>
      </main>

      <Footer
        state={state}
        mustAdvance={mustAdvance}
        xpPerExercise={xpPerExercise}
        idleMessage={labels.idle}
        onContinue={onContinue}
        onAcknowledgeSolution={onAcknowledgeSolution}
      />
    </div>
  );
}

function Footer({
  state, mustAdvance, xpPerExercise, idleMessage, onContinue, onAcknowledgeSolution,
}: {
  state: "idle" | "correct" | "wrong";
  mustAdvance: boolean;
  xpPerExercise: number;
  idleMessage: string;
  onContinue: () => void;
  onAcknowledgeSolution: () => void;
}) {
  const bgClass =
    state === "correct" ? "bg-mint-soft border-mint/40"
    : state === "wrong" ? "bg-peach-soft border-pink/40"
    : "bg-white border-ink/5";

  return (
    <footer
      className={`border-t transition-colors ${bgClass}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-5 flex items-center gap-3 md:gap-4">
        {state === "idle" && (
          <>
            <div className="hidden md:flex items-center gap-3 flex-1">
              <Lumi size={48}/>
              <span className="text-sm font-bold text-ink-soft">{idleMessage}</span>
            </div>
            <button disabled className="w-full md:w-auto md:min-w-[200px] ml-auto py-3 px-6 rounded-full bg-ink-mute/20 text-ink-mute font-black uppercase tracking-wide text-sm">
              Elegí una respuesta
            </button>
          </>
        )}

        {state === "correct" && (
          <>
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <span className="text-3xl md:text-4xl" aria-hidden>🎉</span>
              <div>
                <div className="font-fredoka text-base md:text-xl font-bold text-mint">¡Correcto!</div>
                {xpPerExercise > 0 && (
                  <div className="text-xs md:text-sm font-bold text-ink-soft">+{xpPerExercise} XP</div>
                )}
              </div>
            </div>
            <button onClick={onContinue}
              className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #4DA86A" }}>
              Continuar
            </button>
          </>
        )}

        {state === "wrong" && (
          <>
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <span className="text-3xl md:text-4xl" aria-hidden>{mustAdvance ? "📖" : "💪"}</span>
              <div>
                <div className="font-fredoka text-base md:text-xl font-bold text-pink">
                  {mustAdvance ? "Mirá la solución" : "Casi…"}
                </div>
                <div className="text-xs md:text-sm font-bold text-ink-soft">
                  {mustAdvance ? "Vamos al siguiente" : "Mirá la pista"}
                </div>
              </div>
            </div>
            <button
              onClick={mustAdvance ? onAcknowledgeSolution : onContinue}
              className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-pink text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #D14A6A" }}
            >
              {mustAdvance ? "Entendido" : "Reintentar"}
            </button>
          </>
        )}
      </div>
    </footer>
  );
}

function genOptions(answer: number): number[] {
  const candidates = [answer, answer + 1, Math.max(1, answer - 1), answer + 2, Math.max(0, answer - 2)];
  const unique: number[] = [];
  for (const c of candidates) {
    if (!unique.includes(c)) unique.push(c);
    if (unique.length === 4) break;
  }
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return unique;
}
