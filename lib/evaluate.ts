// lib/evaluate.ts
// Función pura que evalúa la respuesta del niño contra la solution del
// ejercicio. Los kinds representan INTERACCIONES (no materias), así que el
// evaluator es agnóstico al dominio: el mismo MULTIPLE_CHOICE sirve para
// "¿cuántas estrellas?" (math) o "¿qué letra sigue?" (reading).
//
// Formato de `solution.answer` por kind:
//   MULTIPLE_CHOICE → number | string (la opción correcta)
//   INPUT           → number | string (lo tipeado, comparado strict)
//   DRAG_DROP       → number (count de items arrastrados al target)
//   SORT            → (number | string)[] (la secuencia esperada)
//   MATCH           → [number, number][] (pares de índices)
//   DRAW            → boolean (lo evalúa el recognizer del cliente)
//   AUDIO / SPEAK   → number | string (la opción esperada)

import type { ExerciseKind } from "@prisma/client";

export type ExerciseSolution = {
  answer?: number | string;
  sequence?: (number | string)[];
  pairs?: number[][];
};

export function evaluateAttempt(
  kind: ExerciseKind,
  solution: ExerciseSolution,
  response: unknown,
): boolean {
  switch (kind) {
    case "MULTIPLE_CHOICE":
    case "INPUT":
    case "AUDIO":
    case "SPEAK":
      // Comparación strict: number con number, string con string.
      return (
        (typeof response === "number" || typeof response === "string") &&
        response === solution.answer
      );

    case "DRAG_DROP":
      // El componente DragInput devuelve cuántos items hay en el canasto.
      return typeof response === "number" && response === solution.answer;

    case "DRAW":
      // El recognizer de trazos evalúa con `matchesDigit` del cliente y manda
      // un boolean. Acá sólo confirmamos que vino true.
      return response === true;

    case "SORT": {
      if (!Array.isArray(response) || !Array.isArray(solution.sequence)) return false;
      if (response.length !== solution.sequence.length) return false;
      return response.every((v, i) => v === solution.sequence![i]);
    }

    case "MATCH": {
      if (!Array.isArray(response) || !Array.isArray(solution.pairs)) return false;
      if (response.length !== solution.pairs.length) return false;
      // Comparamos como sets para no depender del orden de los pares.
      const got = new Set(response.map((p: number[]) => `${p[0]}-${p[1]}`));
      const want = new Set(solution.pairs.map((p) => `${p[0]}-${p[1]}`));
      if (got.size !== want.size) return false;
      for (const k of got) if (!want.has(k)) return false;
      return true;
    }

    default:
      return false;
  }
}
