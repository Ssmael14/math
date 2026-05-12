// lib/srs.ts
// Spaced repetition simplificado para el modelo Mastery del nuevo schema.
// Estado persistido: { masteryLevel, repetitions, nextReviewAt }.
// El algoritmo está inspirado en SM-2 pero sin guardar easeFactor/interval
// en la DB — los calculamos al vuelo a partir de `repetitions`.
//
// Toda la lógica es pura para que sea testeable sin React ni DB.

export type SrsState = {
  /** Cuántas veces consecutivas acertó (>= quality 3). Se resetea al fallar. */
  repetitions: number;
  /** 0..1 derivado para mostrar progreso en la UI. */
  masteryLevel: number;
};

export const INITIAL_SRS: SrsState = { repetitions: 0, masteryLevel: 0 };

/** Threshold para considerar "dominado" en la UI. */
export const MASTERY_THRESHOLD = 0.8;

/**
 * Mapea la performance del intento a "calidad" 0-5 estilo SM-2.
 *   correct=true  & wrongs=0 → 5
 *   correct=true  & wrongs=1 → 4
 *   correct=true  & wrongs>=2→ 3
 *   correct=false & solutionShown=false → 2
 *   correct=false & solutionShown=true  → 1
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
 * Aplica una review SM-2 simplificada y devuelve el nuevo estado.
 * La fecha del próximo repaso se calcula como now + days(2^repetitions),
 * cap en 60 días (suficiente para "ya está dominado, no me preguntes
 * todo el tiempo").
 */
export function applyReview(prev: SrsState, quality: number): { state: SrsState; intervalDays: number } {
  const q = clamp(Math.round(quality), 0, 5);

  let repetitions = prev.repetitions;
  let masteryLevel = prev.masteryLevel;

  if (q < 3) {
    repetitions = 0;
    masteryLevel = clamp(masteryLevel - 0.25, 0, 1);
  } else {
    repetitions += 1;
    masteryLevel = clamp(masteryLevel + (q === 5 ? 0.25 : q === 4 ? 0.18 : 0.12), 0, 1);
  }

  const intervalDays = q < 3 ? 1 : Math.min(60, Math.pow(2, repetitions));

  return { state: { repetitions, masteryLevel }, intervalDays };
}

/** Próxima fecha de repaso a partir del estado y los días de intervalo. */
export function nextReviewDate(intervalDays: number, now: Date = new Date()): Date {
  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + Math.max(0, intervalDays));
  return next;
}

export function isMastered(masteryLevel: number): boolean {
  return masteryLevel >= MASTERY_THRESHOLD;
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
