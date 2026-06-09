// lib/difficulty.ts
// Dificultad adaptativa por sliding window.
//
// Idea: miramos las últimas N intentos del niño y ajustamos la dificultad
// recomendada (UP / KEEP / DOWN). El algoritmo es pura función — quien lo
// usa decide qué hacer con la recomendación (filtrar ejercicios, recomendar
// otra unidad, etc).
//
//  - accuracy >= 0.9 sostenida → UP   (el niño se aburre, subir)
//  - accuracy <= 0.6 sostenida → DOWN (el niño se frustra, bajar)
//  - en el medio                → KEEP (zona de aprendizaje óptima)

export type DifficultyMove = "UP" | "KEEP" | "DOWN";

/** Cantidad mínima de intentos antes de recomendar un cambio. */
export const MIN_WINDOW = 5;

export const HIGH_THRESHOLD = 0.9;
export const LOW_THRESHOLD = 0.6;

export type AttemptOutcome = { correct: boolean };

/**
 * Calcula la accuracy de los últimos `windowSize` intentos.
 * Si hay menos intentos que `windowSize`, usa los que haya.
 */
export function recentAccuracy(attempts: AttemptOutcome[], windowSize: number = 10): number {
  if (attempts.length === 0) return 0;
  const window = attempts.slice(-windowSize);
  const correct = window.filter((a) => a.correct).length;
  return correct / window.length;
}

/**
 * Recomienda mover dificultad UP/KEEP/DOWN.
 * Devuelve KEEP si todavía no hay suficientes datos para decidir.
 */
export function recommendMove(attempts: AttemptOutcome[], windowSize: number = 10): DifficultyMove {
  if (attempts.length < MIN_WINDOW) return "KEEP";
  const acc = recentAccuracy(attempts, windowSize);
  if (acc >= HIGH_THRESHOLD) return "UP";
  if (acc <= LOW_THRESHOLD) return "DOWN";
  return "KEEP";
}

/**
 * Aplica la recomendación a un nivel numérico (1-N). Clampea al rango [min,max].
 * Útil cuando los ejercicios tienen un campo `difficulty` y quieres filtrar.
 */
export function adjustLevel(
  current: number,
  move: DifficultyMove,
  { min = 1, max = 10 }: { min?: number; max?: number } = {},
): number {
  if (move === "UP") return Math.min(max, current + 1);
  if (move === "DOWN") return Math.max(min, current - 1);
  return current;
}
