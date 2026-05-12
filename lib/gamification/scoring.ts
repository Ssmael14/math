// lib/scoring.ts
// Lógica pura de scoring (estrellas/XP). Aislada para que sea testeable.

export const MAX_STARS = 3;

/**
 * Calcula las estrellas (0–3) en base a la cantidad de respuestas correctas
 * sobre el total de ejercicios de la lección.
 *
 *  - 100% aciertos      → 3 estrellas
 *  - ≥ 66% aciertos     → 2 estrellas
 *  - ≥ 33% aciertos     → 1 estrella
 *  - < 33% aciertos     → 0 estrellas
 *
 * Casos borde: total <= 0 → 0 estrellas.
 */
export function computeStars(correct: number, total: number): number {
  if (total <= 0) return 0;
  const safe = Math.max(0, Math.min(correct, total));
  const ratio = safe / total;
  if (ratio >= 1) return 3;
  if (ratio >= 2 / 3) return 2;
  if (ratio >= 1 / 3) return 1;
  return 0;
}

/**
 * Lunes 00:00 UTC de la semana de `d`. Se usa como key para WeeklyXP/liga.
 * Lo movimos acá para que /api/progress y lib/queries usen la misma función.
 */
export function mondayOfWeek(d: Date = new Date()): Date {
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  m.setUTCDate(m.getUTCDate() + diff);
  return m;
}
