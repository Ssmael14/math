// lib/learning/number-words.ts
// Conteo con voz para pre-lectores: la palabra hablada de cada número.
// Compartido por el Momento Lumi (ConceptIntro) y el arrastre de sumas
// (DragInput) — "uno… dos… tres…" mientras los objetos aparecen/se cuentan.

export const NUMBER_WORDS = [
  "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
  "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis",
  "diecisiete", "dieciocho", "diecinueve", "veinte",
];

/** Palabra del número `n` (1-based). Fuera de rango cae al dígito. */
export function numberWord(n: number): string {
  return NUMBER_WORDS[n - 1] ?? String(n);
}
