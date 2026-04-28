// lib/hints.ts
// Máquina de estados pura para el sistema de pistas progresivas.
//
// Reglas:
//  - 0 errores → no mostrar nada
//  - 1 error   → mostrar pista (si hay)
//  - 2 errores → mostrar explicación + revelar respuesta y avanzar
//
// Esto se separa de LessonRunner para que sea trivialmente testeable y
// para que cualquier futuro renderer (mobile nativo, modo padres, etc.)
// pueda usar la misma política.

export type HintLevel = "none" | "hint" | "solution";

/** Cuántos errores antes de mostrar la solución y forzar avance. */
export const MAX_WRONG_BEFORE_SOLUTION = 2;

export function nextHintLevel(wrongCount: number): HintLevel {
  if (wrongCount <= 0) return "none";
  if (wrongCount === 1) return "hint";
  return "solution";
}

/**
 * Una vez alcanzado el nivel "solution" la lección debe avanzar
 * (no podemos quedar trabados si el niño no sabe la respuesta).
 */
export function shouldAdvanceAfterWrong(wrongCount: number): boolean {
  return wrongCount >= MAX_WRONG_BEFORE_SOLUTION;
}

/**
 * Devuelve la pista a mostrar para un nivel + array de hints disponibles.
 * Si no hay hint configurada para el ejercicio, devuelve null y la UI
 * mostrará un fallback genérico.
 */
export function pickHint(level: HintLevel, hints: string[] | null | undefined): string | null {
  if (level !== "hint") return null;
  if (!hints || hints.length === 0) return null;
  return hints[0];
}
