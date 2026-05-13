// lib/streak.ts
// Lógica pura para calcular el streak de un niño cuando completa una lección.
// Se separa así para que sea fácilmente testeable sin tocar la DB.

/**
 * Devuelve el dia (UTC, sin hora) de un Date como número YYYYMMDD.
 * Lo usamos para comparar "mismo día" / "día siguiente" sin importar la hora.
 */
function dayKey(d: Date): number {
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
}

/**
 * Calcula el nuevo streak.
 *  - Si jugó por primera vez                → 1
 *  - Si la última jugada fue hoy            → mismo streak (ya contó hoy)
 *  - Si la última jugada fue ayer           → streak + 1
 *  - Si pasó más de 1 día sin jugar         → 1 (se rompió)
 */
export function computeNextStreak(
  prevStreak: number,
  lastPlay: Date | null,
  now: Date = new Date(),
): number {
  if (!lastPlay) return 1;

  const last = dayKey(lastPlay);
  const today = dayKey(now);

  if (last === today) return prevStreak;

  // Día siguiente exacto: lastPlay + 1 día == hoy
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  if (last === dayKey(yesterday)) return prevStreak + 1;

  return 1;
}
