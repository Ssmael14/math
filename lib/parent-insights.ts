// lib/parent-insights.ts
// Helpers puros que transforman datos crudos (Attempts, Masteries) en
// insights útiles para el dashboard de padres. Aislados acá para que sean
// testeables sin DB y reutilizables.

export type AttemptRow = {
  exerciseId: string;
  correct: boolean;
  timeMs: number;
  createdAt: Date;
};

export type ExerciseLite = {
  id: string;
  prompt: string;
  kind: string;
};

export type WeakSpot = {
  exerciseId: string;
  prompt: string;
  kind: string;
  attempts: number;
  wrongs: number;
  errorRate: number;       // wrongs / attempts
  avgTimeMs: number;
};

/**
 * Calcula los "conceptos difíciles": ejercicios con al menos `minAttempts`
 * intentos y errorRate ≥ `minErrorRate`. Ordenados por errorRate desc.
 *
 * Pensado para responder "¿qué le cuesta más al niño?" en lenguaje claro.
 */
export function findWeakSpots(
  attempts: AttemptRow[],
  exercises: ExerciseLite[],
  { minAttempts = 3, minErrorRate = 0.3, limit = 5 }: {
    minAttempts?: number;
    minErrorRate?: number;
    limit?: number;
  } = {},
): WeakSpot[] {
  const byExercise = new Map<string, { total: number; wrongs: number; timeMs: number }>();

  for (const a of attempts) {
    const cur = byExercise.get(a.exerciseId) ?? { total: 0, wrongs: 0, timeMs: 0 };
    cur.total += 1;
    if (!a.correct) cur.wrongs += 1;
    cur.timeMs += a.timeMs;
    byExercise.set(a.exerciseId, cur);
  }

  const exById = new Map(exercises.map((e) => [e.id, e]));
  const rows: WeakSpot[] = [];

  for (const [exerciseId, agg] of byExercise) {
    if (agg.total < minAttempts) continue;
    const errorRate = agg.wrongs / agg.total;
    if (errorRate < minErrorRate) continue;
    const ex = exById.get(exerciseId);
    if (!ex) continue;
    rows.push({
      exerciseId,
      prompt: ex.prompt,
      kind: ex.kind,
      attempts: agg.total,
      wrongs: agg.wrongs,
      errorRate,
      avgTimeMs: Math.round(agg.timeMs / agg.total),
    });
  }

  rows.sort((a, b) => b.errorRate - a.errorRate || b.attempts - a.attempts);
  return rows.slice(0, limit);
}

/**
 * Cuántos días distintos jugó en una ventana (típicamente últimos N días).
 * Devuelve 0..N.
 */
export function activeDays(attempts: AttemptRow[], days: number, now: Date = new Date()): number {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const set = new Set<string>();
  for (const a of attempts) {
    if (a.createdAt < start) continue;
    const d = a.createdAt;
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
    set.add(key);
  }
  return set.size;
}

/**
 * Tiempo promedio por ejercicio en milisegundos. 0 si no hay intentos.
 */
export function avgExerciseTimeMs(attempts: AttemptRow[]): number {
  if (attempts.length === 0) return 0;
  const sum = attempts.reduce((s, a) => s + a.timeMs, 0);
  return Math.round(sum / attempts.length);
}
