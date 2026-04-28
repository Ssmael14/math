// lib/srs.ts
// Spaced repetition system, basado en SM-2 (Piotr Wozniak, SuperMemo).
//
// Mapping para nuestra app:
//
//   correcto, sin errores ni hints   → quality 5  (excelente)
//   correcto tras 1 error (vio pista)→ quality 3  (con esfuerzo)
//   incorrecto pero contestó algo    → quality 2  (cerca)
//   forzado a ver la solución        → quality 1  (lo perdió)
//
// El algoritmo decide cuándo volver a mostrarle el ejercicio.
//
// Toda la lógica acá es pura: recibe el estado anterior + la calidad y devuelve
// el nuevo estado. Persistencia en /api/attempts.

export type SrsState = {
  easeFactor: number;
  interval: number;          // días al próximo repaso
  repetitions: number;        // aciertos consecutivos (>= 3 quality)
  masteryLevel: number;       // 0-1 derivado, para UI
};

/** Estado inicial cuando el niño ve un ejercicio por primera vez. */
export const INITIAL_SRS: SrsState = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  masteryLevel: 0,
};

/** Threshold para considerar "dominado" en la UI. */
export const MASTERY_THRESHOLD = 0.8;

/**
 * Calcula la "calidad" SM-2 (0-5) a partir de los datos que tenemos.
 *
 *  - correct=true  & wrongs=0 → 5
 *  - correct=true  & wrongs=1 → 4
 *  - correct=true  & wrongs>=2→ 3
 *  - correct=false & solutionShown=false → 2
 *  - correct=false & solutionShown=true  → 1
 */
export function gradeQuality({
  correct,
  priorWrongs,
  solutionShown,
}: {
  correct: boolean;
  priorWrongs: number;
  solutionShown: boolean;
}): number {
  if (correct) {
    if (priorWrongs <= 0) return 5;
    if (priorWrongs === 1) return 4;
    return 3;
  }
  return solutionShown ? 1 : 2;
}

/**
 * Aplica una "review" SM-2 al estado anterior.
 * Devuelve el nuevo estado + a cuántos días está el próximo repaso.
 */
export function applyReview(prev: SrsState, quality: number): SrsState {
  const q = clamp(Math.round(quality), 0, 5);

  // Ease factor: ajuste estándar SM-2.
  const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const ef = Math.max(1.3, prev.easeFactor + efDelta);

  let repetitions = prev.repetitions;
  let interval: number;

  if (q < 3) {
    // Falló: reset.
    repetitions = 0;
    interval = 1; // mostrarlo mañana
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(prev.interval * ef);
  }

  // Mastery level derivado: empuja hacia 1 con cada acierto, retrocede al fallar.
  // Es una métrica de UI, no afecta el algoritmo.
  const delta = q >= 4 ? 0.2 : q === 3 ? 0.1 : -0.25;
  const masteryLevel = clamp(prev.masteryLevel + delta, 0, 1);

  return { easeFactor: ef, interval, repetitions, masteryLevel };
}

/** Devuelve la fecha del próximo repaso a partir de un estado SRS. */
export function nextReviewDate(state: SrsState, now: Date = new Date()): Date {
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + Math.max(0, state.interval));
  return next;
}

/** True si el ejercicio está "dominado" según el threshold. */
export function isMastered(masteryLevel: number): boolean {
  return masteryLevel >= MASTERY_THRESHOLD;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
