// lib/evaluate.ts
// Función pura que dado un ejercicio + la respuesta del niño dice si está
// bien. Cada kind tiene su propio formato de respuesta:
//
//   COUNT/DRAG/SUBTRACT/FILL → number  (la opción elegida)
//   ORDER → number[]                    (los números en el orden elegido)
//   MATCH → [number, number][]         (pares groupIdx ↔ optionIdx)
//   TRACE → boolean                     (matchesDigit lo evalúa antes)
//
// Aislar acá la lógica permite testear sin React y sin DB, y deja al
// ExerciseRunner agnóstico del tipo de ejercicio.

import type { ExerciseKind } from "@prisma/client";

export type ExerciseSolution = {
  answer?: number;
  digit?: number;
  order?: number[];
  pairs?: number[][];
};

export function evaluateAttempt(
  kind: ExerciseKind,
  solution: ExerciseSolution,
  response: unknown,
): boolean {
  switch (kind) {
    case "COUNT":
    case "DRAG":
    case "SUBTRACT":
    case "FILL":
      return typeof response === "number" && response === solution.answer;

    case "TRACE":
      // El componente de trazo evalúa con matchesDigit y manda el bool.
      return response === true;

    case "ORDER": {
      if (!Array.isArray(response) || !Array.isArray(solution.order)) return false;
      if (response.length !== solution.order.length) return false;
      return response.every((v, i) => v === solution.order![i]);
    }

    case "MATCH": {
      if (!Array.isArray(response) || !Array.isArray(solution.pairs)) return false;
      if (response.length !== solution.pairs.length) return false;
      // Comparamos como sets de strings para no depender del orden.
      const got = new Set(response.map((p: number[]) => `${p[0]}-${p[1]}`));
      const want = new Set(solution.pairs.map((p) => `${p[0]}-${p[1]}`));
      if (got.size !== want.size) return false;
      for (const k of got) if (!want.has(k)) return false;
      return true;
    }

    case "SPEED":
      return false; // no implementado

    default:
      return false;
  }
}
