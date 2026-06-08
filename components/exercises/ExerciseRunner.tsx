"use client";
// components/exercises/ExerciseRunner.tsx
// Loop genérico de "una secuencia de ejercicios" — alimenta tanto la lección
// normal (LessonRunner) como el modo Repaso del día (ReviewRunner).
//
// El runner es agnóstico al kind: maneja el flujo (idle → correct/wrong →
// continue), pero la INPUT (cómo elige el niño la respuesta) y la EVALUACIÓN
// (si la respuesta está bien) están separadas por kind.
//
// Cada subcomponente de input dispara onAnswer({ value, correct }) cuando
// el niño termina de responder. evaluateAttempt() en lib/evaluate.ts decide
// la corrección.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { ExerciseVisual } from "@/components/exercises/ExerciseVisual";
import { OptionsGrid } from "@/components/exercises/OptionsGrid";
import { HintPanel } from "@/components/exercises/HintPanel";
import { TraceCanvas } from "@/components/exercises/TraceCanvas";
import { SpeakerButton } from "@/components/exercises/SpeakerButton";
import { ConceptIntro } from "@/components/exercises/ConceptIntro";
import { MatchInput } from "@/components/exercises/inputs/MatchInput";
import { OrderInput } from "@/components/exercises/inputs/OrderInput";
import { NumericKeypadInput } from "@/components/exercises/inputs/NumericKeypadInput";
import { DragInput } from "@/components/exercises/inputs/DragInput";
import { TakeAwayInput } from "@/components/exercises/inputs/TakeAwayInput";
import { CountTapInput } from "@/components/exercises/inputs/CountTapInput";
import { ChoiceButtonsInput } from "@/components/exercises/inputs/ChoiceButtonsInput";
import { ObjectOrderInput } from "@/components/exercises/inputs/ObjectOrderInput";
import { PartWholeInput } from "@/components/exercises/inputs/PartWholeInput";
import { SameMatchInput } from "@/components/exercises/inputs/SameMatchInput";
import { SortAttributeInput } from "@/components/exercises/inputs/SortAttributeInput";
import type { ExerciseDTO, TeachContent } from "@/components/exercises/types";
import { nextHintLevel, shouldAdvanceAfterWrong, pickHint } from "@/lib/learning/hints";
import { postOrQueue } from "@/lib/offline-queue";
import { evaluateAttempt } from "@/lib/learning/evaluate";
import { gradedCount, parseTeach, precedingTeach } from "@/lib/learning/teach";
import { playCorrect, playWrong, playTap } from "@/lib/gamification/audio";
// matchesDigit ya no se usa: el scoring de trazo lo hace TraceCanvas vía
// lib/learning/trace-scoring (cobertura de máscara).

export type RunnerLabels = {
  step: string;
  idle: string;
};

type RunnerState = "idle" | "selected" | "correct" | "wrong";

type Verdict = {
  correct: boolean;
  /** Sólo para kinds con score parcial (hoy: DRAW/trace). 0-3. */
  stars?: 0 | 1 | 2 | 3;
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
  reviewMode?: boolean;
  labels?: RunnerLabels;
  onComplete: (result: { correctCount: number; total: number }) => void | Promise<void>;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  // selection = lo que el niño eligió/armó, AÚN NO evaluado.
  // verdict   = resultado, sólo tras tocar "Comprobar" (o "Terminé" en trace).
  const [selection, setSelection] = useState<{ value: unknown } | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [exerciseStartedAt, setExerciseStartedAt] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  // resetSignal cambia cada vez que volvemos a idle desde wrong, para que
  // los inputs internos (canvas, match, order) limpien su estado local.
  const [resetSignal, setResetSignal] = useState(0);
  // Re-enseñar al trabarse: cuando el niño agota los intentos, mostramos de
  // nuevo el Momento Lumi previo antes de avanzar (null = no estamos en eso).
  const [reteach, setReteach] = useState<TeachContent | null>(null);

  const ex = exercises[i];
  // Los pasos TEACH no se califican: el denominador de estrellas/XP cuenta
  // solo los ejercicios reales.
  const gradedTotal = useMemo(
    () => gradedCount(exercises.map((e) => e.kind)),
    [exercises],
  );
  const teach = ex.kind === "TEACH" ? parseTeach(ex.payload) : null;
  // 4 estados: idle (nada) · selected (eligió, sin chequear) · correct · wrong.
  const state: RunnerState =
    verdict === null
      ? selection === null ? "idle" : "selected"
      : verdict.correct ? "correct" : "wrong";
  const hintLevel = nextHintLevel(wrongCount);
  const mustAdvance = shouldAdvanceAfterWrong(wrongCount);

  // Sonido + haptic + animación cuando el state cambia desde idle hacia
  // correct/wrong. Ref guarda el último estado para detectar la transición
  // y no disparar en cada re-render. animClass se limpia en onAnimationEnd
  // para que la próxima transición pueda re-disparar la misma animación.
  const prevStateRef = useRef(state);
  const [animClass, setAnimClass] = useState("");
  useEffect(() => {
    const prev = prevStateRef.current;
    // El veredicto aparece al "Comprobar"/"Terminé": disparamos sonido y
    // animación en la transición selected→correct/wrong (o idle→… en trace).
    if (prev !== "correct" && state === "correct") {
      playCorrect();
      setAnimClass("animate-correct-pop");
    }
    if (prev !== "wrong" && state === "wrong") {
      playWrong();
      setAnimClass("animate-wrong-shake");
    }
    prevStateRef.current = state;
  }, [state]);

  // Un TEACH con payload mal formado no debe trabar la lección: se saltea.
  useEffect(() => {
    if (ex.kind === "TEACH" && !teach) void advance(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  // Texto/valor de "respuesta" para el HintPanel.
  const solutionAnswer = ex.solution.answer ?? null;

  // Opciones aleatorias sólo para los kinds que las usan (MULTIPLE_CHOICE
  // con visuales numéricos). Si la answer no es numérica (compare/parity)
  // usamos 0 — esos visuales no muestran OptionsGrid igual.
  const numericAnswer = typeof ex.solution.answer === "number" ? ex.solution.answer : 0;
  const options = useMemo(() => genOptions(numericAnswer), [ex.id, numericAnswer]);

  // El niño elige/arma una respuesta — todavía NO se evalúa.
  function select(value: unknown) {
    if (verdict !== null) return; // ya chequeado, no permitir re-seleccionar
    setSelection({ value });
  }

  // "Comprobar": ahora sí evaluamos la selección. Disparado por el botón
  // del footer (nunca automático al elegir).
  function comprobar() {
    if (selection === null || verdict !== null) return;
    const correct = evaluateAttempt(ex.kind, ex.solution, selection.value);
    setVerdict({ correct });
  }

  // TRACE evalúa al tocar "Terminé" dentro del TraceCanvas (su propia acción
  // explícita de chequeo). El canvas ya computó el score por cobertura.
  function onTraceResult(r: { correct: boolean; stars: 0 | 1 | 2 | 3 }) {
    if (verdict !== null) return;
    const correct = evaluateAttempt(ex.kind, ex.solution, r.correct);
    setSelection({ value: r.correct });
    setVerdict({ correct, stars: r.stars });
  }

  async function recordAttempt(
    correct: boolean,
    response: unknown,
    srs: { final: boolean; priorWrongs: number; solutionShown: boolean },
  ) {
    await postOrQueue("/api/attempts", {
      childId, exerciseId: ex.id, correct, response,
      timeMs: Date.now() - exerciseStartedAt,
      reviewMode,
      ...srs,
    });
  }

  async function advance(scoreCorrect: boolean) {
    const nextCount = correctCount + (scoreCorrect ? 1 : 0);
    setCorrectCount(nextCount);

    if (i + 1 >= exercises.length) {
      await onComplete({ correctCount: nextCount, total: gradedTotal });
      return;
    }

    setI(i + 1);
    setSelection(null);
    setVerdict(null);
    setWrongCount(0);
    setExerciseStartedAt(Date.now());
    setResetSignal((s) => s + 1);
  }

  async function onContinue() {
    if (state === "correct") {
      await recordAttempt(true, selection?.value, {
        final: true, priorWrongs: wrongCount, solutionShown: false,
      });
      await advance(true);
      return;
    }

    const next = wrongCount + 1;
    setWrongCount(next);

    if (shouldAdvanceAfterWrong(next)) {
      // Cierre del ejercicio con solución revelada — único intento que
      // descuenta corazón en el server (ver /api/attempts).
      await recordAttempt(false, selection?.value, {
        final: true, priorWrongs: wrongCount, solutionShown: true,
      });
      return;
    }

    // Wrong intermedio: NO es final, server lo registra para analytics
    // pero no descuenta corazón. Limpiamos selección+veredicto para que el
    // niño vuelva a intentar (y los inputs internos se remontan).
    await recordAttempt(false, selection?.value, {
      final: false, priorWrongs: wrongCount, solutionShown: false,
    });
    setSelection(null);
    setVerdict(null);
    setResetSignal((s) => s + 1);
  }

  async function onAcknowledgeSolution() {
    // Si este ejercicio venía precedido de un Momento Lumi, lo re-enseñamos
    // antes de seguir. En unidades sin TEACH precedingTeach() devuelve null
    // y el flujo es el de siempre.
    const rt = precedingTeach(exercises, i);
    if (rt) {
      setReteach(rt);
      return;
    }
    await advance(false);
  }

  const progress = ((i + (state === "correct" ? 1 : 0)) / exercises.length) * 100;

  // Re-enseñanza tras trabarse: reusa el mismo Momento Lumi con copys
  // más suaves. Al terminar avanza al siguiente ejercicio.
  if (reteach) {
    return (
      <ConceptIntro
        content={reteach}
        variant="reteach"
        onDone={() => {
          setReteach(null);
          void advance(false);
        }}
      />
    );
  }

  // Momento Lumi: enseñanza no calificada. Toma la pantalla completa con su
  // propia narración/footer; al terminar avanza al siguiente paso.
  if (ex.kind === "TEACH") {
    if (!teach) return null; // el effect de arriba ya lo está salteando
    return <ConceptIntro content={teach} onDone={() => void advance(false)} />;
  }

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

      {/* my-auto en el child centra verticalmente cuando hay espacio sobrante,
          y permite scroll del body cuando el contenido excede el viewport
          (clave para mobile chico + DragInput / teclado numérico). */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-6 md:py-12">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center my-auto">
          <div className="text-[10px] md:text-xs font-black text-ink-mute tracking-widest mb-2">
            {labels.step} {i + 1} / {exercises.length}
          </div>
          <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
            <h2 className="font-fredoka text-xl md:text-3xl font-bold text-ink text-center text-balance">
              {ex.prompt}
            </h2>
            <SpeakerButton text={ex.prompt} audioUrl={ex.audioUrl} autoPlayKey={ex.id} />
          </div>

          <div
            className={`w-full flex flex-col items-center ${animClass}`}
            onAnimationEnd={() => setAnimClass("")}
          >
            <KindBody
              ex={ex}
              state={state}
              selectedValue={selection?.value ?? null}
              options={options}
              // Los inputs se bloquean recién cuando hay veredicto, NO al
              // elegir — el niño puede cambiar la respuesta antes de Comprobar.
              disabled={verdict !== null}
              resetSignal={resetSignal}
              showSolution={hintLevel === "solution"}
              onSelectNumeric={(n) => select(n)}
              onSelectString={(s) => select(s)}
              onSelectStructured={(value) => select(value)}
              onTraceResult={onTraceResult}
              onMatchComplete={(pairs) => select(pairs)}
              onOrderComplete={(seq) => select(seq)}
            />
          </div>

          {hintLevel !== "none" && (
            <div className="w-full mt-6 flex justify-center">
              <HintPanel
                level={hintLevel}
                hint={pickHint(hintLevel, ex.hints ?? null)}
                explanation={ex.explanation ?? null}
                answer={solutionAnswer}
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
        traceStars={verdict?.stars}
        onComprobar={comprobar}
        onContinue={onContinue}
        onAcknowledgeSolution={onAcknowledgeSolution}
      />
    </div>
  );
}

function KindBody({
  ex, state, selectedValue, options, disabled, resetSignal, showSolution,
  onSelectNumeric, onSelectString, onSelectStructured, onTraceResult, onMatchComplete, onOrderComplete,
}: {
  ex: ExerciseDTO;
  state: RunnerState;
  selectedValue: unknown;
  options: number[];
  disabled: boolean;
  resetSignal: number;
  showSolution: boolean;
  onSelectNumeric: (n: number) => void;
  onSelectString: (s: string) => void;
  onSelectStructured: (value: unknown) => void;
  onTraceResult: (r: { correct: boolean; stars: 0 | 1 | 2 | 3 }) => void;
  onMatchComplete: (pairs: number[][]) => void;
  onOrderComplete: (seq: (number | string)[]) => void;
}) {
  const numericPicked = typeof selectedValue === "number" ? selectedValue : null;
  const stringPicked = typeof selectedValue === "string" ? selectedValue : null;
  const visual = typeof ex.payload.visual === "string" ? ex.payload.visual : null;

  // El kind es la INTERACCIÓN (cómo responde el niño). El visual previo lo
  // decide payload.visual y lo dibuja <ExerciseVisual>.
  if (ex.kind === "DRAW") {
    // Para DRAW el "visual" y el "input" son el mismo canvas.
    const digit = typeof ex.payload.digit === "number" ? (ex.payload.digit as number) : 0;
    return (
      <div className="w-full flex justify-center mb-4 md:mb-8">
        <TraceCanvas
          key={resetSignal}
          digit={digit}
          onResult={onTraceResult}
          disabled={disabled}
          showSolution={showSolution}
          size={typeof window !== "undefined" && window.innerWidth < 380 ? 240 : 280}
        />
      </div>
    );
  }

  if (ex.kind === "MATCH") {
    if (visual === "same-match") {
      const payload = ex.payload as {
        left?: { id: string; emoji: string; label?: string }[];
        right?: { id: string; emoji: string; label?: string }[];
      };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-8">
          <SameMatchInput
            key={resetSignal}
            left={Array.isArray(payload.left) ? payload.left : []}
            right={Array.isArray(payload.right) ? payload.right : []}
            disabled={disabled}
            onComplete={onMatchComplete}
          />
        </div>
      );
    }

    const payload = ex.payload as { groups?: { item: string; count: number }[]; options?: number[] };
    const groups = Array.isArray(payload.groups) ? payload.groups : [];
    const opts = Array.isArray(payload.options) ? payload.options : [];
    return (
      <div className="w-full flex justify-center mb-4 md:mb-8">
        <MatchInput
          key={resetSignal}
          groups={groups}
          options={opts}
          disabled={disabled}
          onComplete={onMatchComplete}
        />
      </div>
    );
  }

  if (ex.kind === "SORT") {
    if (visual === "order-objects") {
      const payload = ex.payload as { objects?: { id: string; emoji: string; label?: string; size?: number }[] };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-8">
          <ObjectOrderInput
            key={resetSignal}
            objects={Array.isArray(payload.objects) ? payload.objects : []}
            disabled={disabled}
            onComplete={onOrderComplete}
          />
        </div>
      );
    }

    const payload = ex.payload as { numbers?: number[] };
    const numbers = Array.isArray(payload.numbers) ? payload.numbers : [];
    return (
      <div className="w-full flex justify-center mb-4 md:mb-8">
        <OrderInput
          key={resetSignal}
          numbers={numbers}
          disabled={disabled}
          onComplete={onOrderComplete}
        />
      </div>
    );
  }

  if (ex.kind === "DRAG_DROP") {
    if (visual === "sort-attribute") {
      const payload = ex.payload as {
        items?: { id: string; emoji: string; label?: string }[];
        categories?: { id: string; label: string; emoji?: string }[];
      };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-6">
          <SortAttributeInput
            key={resetSignal}
            items={Array.isArray(payload.items) ? payload.items : []}
            categories={Array.isArray(payload.categories) ? payload.categories : []}
            disabled={disabled}
            onComplete={onSelectStructured}
          />
        </div>
      );
    }

    if (visual === "part-whole") {
      const payload = ex.payload as { total?: number; item?: string };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-6">
          <PartWholeInput
            key={resetSignal}
            total={payload.total ?? 0}
            item={payload.item ?? "⭐"}
            disabled={disabled}
            onComplete={onSelectStructured}
          />
        </div>
      );
    }

    // Drag real con canasto. El ExerciseVisual no se monta — los items son
    // el visual.
    const payload = ex.payload as { a?: number; b?: number; item?: string };
    return (
      <div className="w-full flex justify-center mb-4 md:mb-6">
        <DragInput
          key={resetSignal}
          a={payload.a ?? 0}
          b={payload.b ?? 0}
          item={payload.item ?? "⭐"}
          disabled={disabled}
          verified={state === "correct"}
          onSubmit={onSelectNumeric}
        />
      </div>
    );
  }

  if (ex.kind === "INPUT") {
    // Tipear la respuesta con un teclado numérico. Para textos largos
    // (cuando lleguemos a Reading) usaríamos un input de texto distinto.
    return (
      <>
        <div className="w-full flex justify-center mb-6 md:mb-8">
          <ExerciseVisual ex={ex}/>
        </div>
        <div className="w-full flex justify-center">
          <NumericKeypadInput
            key={resetSignal}
            max={20}
            disabled={disabled}
            onSubmit={onSelectNumeric}
          />
        </div>
      </>
    );
  }

  if (ex.kind === "MULTIPLE_CHOICE") {
    // 0a) Contar tocando: correspondencia uno-a-uno en vez de elegir un
    //     número. Es la base del conteo a los 4-6.
    if (visual === "count") {
      const p = ex.payload as { count?: number; item?: string };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-6">
          <CountTapInput
            key={resetSignal}
            count={p.count ?? 0}
            item={p.item ?? "⭐"}
            disabled={disabled}
            verified={state === "correct"}
            onSubmit={onSelectNumeric}
          />
        </div>
      );
    }

    // 0b) Resta concreta: en vez de elegir un número, el niño SACA objetos
    //    tocándolos y cuenta los que quedan (concreto antes que abstracto).
    if (visual === "subtract") {
      const p = ex.payload as { total?: number; removed?: number; item?: string };
      return (
        <div className="w-full flex justify-center mb-4 md:mb-6">
          <TakeAwayInput
            key={resetSignal}
            total={p.total ?? 0}
            removed={p.removed ?? 0}
            item={p.item ?? "⭐"}
            disabled={disabled}
            verified={state === "correct"}
            onSubmit={onSelectNumeric}
          />
        </div>
      );
    }

    // 1) Visuales con choices fijas (compare/parity) — siguen hardcoded
    //    porque tienen sub-labels específicos.
    if (visual === "compare") {
      return (
        <>
          <div className="w-full flex justify-center mb-6 md:mb-8">
            <ExerciseVisual ex={ex}/>
          </div>
          <ChoiceButtonsInput
            choices={[
              { value: "<", label: "<", sub: "menor" },
              { value: "=", label: "=", sub: "igual" },
              { value: ">", label: ">", sub: "mayor" },
            ]}
            disabled={disabled}
            selected={stringPicked as never}
            onPick={onSelectString}
          />
        </>
      );
    }
    if (visual === "parity") {
      return (
        <>
          <div className="w-full flex justify-center mb-6 md:mb-8">
            <ExerciseVisual ex={ex}/>
          </div>
          <ChoiceButtonsInput
            choices={[
              { value: "par", label: "Par", sub: "se reparte de a 2" },
              { value: "impar", label: "Impar", sub: "queda uno solo" },
            ]}
            disabled={disabled}
            selected={stringPicked as never}
            onPick={onSelectString}
          />
        </>
      );
    }

    // 2) Si el payload trae options como string[] (Reading, science, etc.),
    //    renderear con ChoiceButtonsInput dinámicos. Esto destraba el motor
    //    multi-materia sin necesidad de cases nuevos por subject.
    const payloadOptions = (ex.payload as { options?: unknown }).options;
    if (Array.isArray(payloadOptions) && payloadOptions.every((o) => typeof o === "string")) {
      return (
        <>
          <div className="w-full flex justify-center mb-6 md:mb-8">
            <ExerciseVisual ex={ex}/>
          </div>
          <ChoiceButtonsInput
            choices={(payloadOptions as string[]).map((o) => ({ value: o, label: o }))}
            disabled={disabled}
            selected={stringPicked as never}
            onPick={onSelectString}
          />
        </>
      );
    }

    // 3) Default: opciones numéricas (count, subtract, etc.) — OptionsGrid
    //    auto-genera 4 alternativas alrededor de la answer.
    return (
      <>
        <div className="w-full flex justify-center mb-8 md:mb-12">
          <ExerciseVisual ex={ex}/>
        </div>
        <OptionsGrid options={options} picked={numericPicked} state={state} onPick={onSelectNumeric}/>
      </>
    );
  }

  // AUDIO / SPEAK aún no implementados — placeholder.
  return (
    <div className="text-center text-ink-soft italic py-8">
      Ejercicio en construcción ({ex.kind})
    </div>
  );
}

function Footer({
  state, mustAdvance, xpPerExercise, idleMessage, traceStars,
  onComprobar, onContinue, onAcknowledgeSolution,
}: {
  state: RunnerState;
  mustAdvance: boolean;
  xpPerExercise: number;
  idleMessage: string;
  /** Estrellas (0-3) para feedback granular de TRACE. */
  traceStars?: 0 | 1 | 2 | 3;
  onComprobar: () => void;
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

        {state === "selected" && (
          <>
            <div className="hidden md:flex items-center gap-3 flex-1">
              <Lumi size={48}/>
              <span className="text-sm font-bold text-ink-soft">¿Estás seguro? Tocá Comprobar.</span>
            </div>
            <button
              onClick={() => { playTap(); onComprobar(); }}
              className="btn-chunky w-full md:w-auto md:min-w-[200px] ml-auto py-3 px-8 rounded-full bg-sky text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #2C8FB8" }}
            >
              Comprobar ✓
            </button>
          </>
        )}

        {state === "correct" && (
          <>
            <div className="flex items-center gap-2 md:gap-3 flex-1">
              <span className="text-3xl md:text-4xl" aria-hidden>🎉</span>
              <div>
                <div className="font-fredoka text-base md:text-xl font-bold text-mint">
                  {traceStars === 3 ? "¡Excelente trazo!" :
                   traceStars === 2 ? "¡Muy bien!" :
                   traceStars === 1 ? "¡Casi perfecto!" :
                   "¡Correcto!"}
                </div>
                {traceStars !== undefined ? (
                  <div className="text-base" aria-label={`${traceStars} de 3 estrellas`}>
                    {"⭐".repeat(traceStars)}<span className="opacity-25">{"⭐".repeat(3 - traceStars)}</span>
                  </div>
                ) : xpPerExercise > 0 && (
                  <div className="text-xs md:text-sm font-bold text-ink-soft">+{xpPerExercise} XP</div>
                )}
              </div>
            </div>
            <button onClick={() => { playTap(); onContinue(); }}
              className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #1F9E46" }}>
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
              onClick={() => { playTap(); (mustAdvance ? onAcknowledgeSolution : onContinue)(); }}
              className="btn-chunky py-3 px-8 md:px-10 rounded-full bg-pink text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #C93658" }}
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
