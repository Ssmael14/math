// lib/age.ts
// Helper para convertir birthDate → años actuales. El schema guarda birthDate
// (fijo), pero la UI muestra "X años" — calculado al vuelo.

export function ageFromBirthDate(birthDate: Date | null | undefined, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const yDiff = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const mDiff = now.getUTCMonth() - birthDate.getUTCMonth();
  const dDiff = now.getUTCDate() - birthDate.getUTCDate();
  // Si todavía no llegó al cumpleaños de este año, restamos uno.
  if (mDiff < 0 || (mDiff === 0 && dDiff < 0)) return Math.max(0, yDiff - 1);
  return Math.max(0, yDiff);
}
