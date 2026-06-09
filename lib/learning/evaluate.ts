// lib/evaluate.ts
// Función pura que evalúa la respuesta del niño contra la solution del
// ejercicio. Los kinds representan INTERACCIONES (no materias), así que el
// evaluator es agnóstico al dominio: el mismo MULTIPLE_CHOICE sirve para
// "¿cuántas estrellas?" (math) o "¿qué letra sigue?" (reading).
//
// Formato de `solution.answer` por kind:
//   MULTIPLE_CHOICE → number | string (la opción correcta)
//   INPUT           → number | string (lo tipeado, comparado strict)
//   DRAG_DROP       → number (canasta), { groups } (clasificar) o { parts }
//   SORT            → (number | string)[] (la secuencia esperada)
//   MATCH           → [number, number][] (pares de índices)
//   DRAW            → boolean (lo evalúa el recognizer del cliente)
//   AUDIO / SPEAK   → number | string (la opción esperada)

import type { ExerciseKind } from "@prisma/client";

export type ExerciseSolution = {
  answer?: number | string;
  sequence?: (number | string)[];
  pairs?: number[][];
  groups?: Record<string, string[]>;
  total?: number;
  parts?: number[];
};

type GroupResponse = { groups?: unknown };
type PartsResponse = { parts?: unknown };

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
      // DragInput de sumas devuelve un número. Los juegos nuevos devuelven
      // estructuras pequeñas para clasificar o separar en partes.
      if (typeof response === "number") return response === solution.answer;
      if (solution.groups) return sameGroups(solution.groups, (response as GroupResponse)?.groups);
      if (solution.parts) return sameParts(solution.parts, (response as PartsResponse)?.parts);
      return false;

    case "DRAW":
      // El recognizer de trazos evalúa con `matchesDigit` del cliente y manda
      // un boolean. Aquí sólo confirmamos que vino true.
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

function sameGroups(expected: Record<string, string[]>, raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const got = raw as Record<string, unknown>;
  const expectedKeys = Object.keys(expected).sort();
  const gotKeys = Object.keys(got).sort();
  if (expectedKeys.length !== gotKeys.length) return false;
  if (!expectedKeys.every((k, i) => k === gotKeys[i])) return false;

  return expectedKeys.every((key) => {
    const expectedItems = [...expected[key]].sort();
    const gotItems = got[key];
    if (!Array.isArray(gotItems) || !gotItems.every((v) => typeof v === "string")) return false;
    const actualItems = [...gotItems].sort();
    return expectedItems.length === actualItems.length && expectedItems.every((v, i) => v === actualItems[i]);
  });
}

function sameParts(expected: number[], raw: unknown): boolean {
  if (!Array.isArray(raw) || !raw.every((v) => typeof v === "number")) return false;
  const a = [...expected].sort((x, y) => x - y);
  const b = [...raw].sort((x, y) => x - y);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
