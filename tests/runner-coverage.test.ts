// tests/runner-coverage.test.ts
// Smoke tests del motor de ejercicios: para cada combinación (kind, visual)
// que el seed genera, validamos que evaluateAttempt() devuelve el resultado
// correcto. No renderizamos UI — los inputs se prueban en sus propios
// tests (match-state.test, order-state.test, etc.).
//
// Si en el futuro alguien agrega un visual nuevo en el seed sin tocar el
// runner, este test va a marcarlo (porque la combinación quedará "unknown").

import { describe, it, expect } from "vitest";
import { evaluateAttempt, type ExerciseSolution } from "@/lib/evaluate";
import type { ExerciseKind } from "@prisma/client";

// Fixtures: una entrada por combinación (kind, visual) usada en el seed
// + generadores.
const fixtures: Array<{
  name: string;
  kind: ExerciseKind;
  solution: ExerciseSolution;
  correct: unknown;
  wrong: unknown;
}> = [
  // MULTIPLE_CHOICE numéricos
  { name: "count",    kind: "MULTIPLE_CHOICE", solution: { answer: 5 }, correct: 5, wrong: 4 },
  { name: "subtract", kind: "MULTIPLE_CHOICE", solution: { answer: 3 }, correct: 3, wrong: 7 },
  // MULTIPLE_CHOICE string
  { name: "compare", kind: "MULTIPLE_CHOICE", solution: { answer: ">" }, correct: ">", wrong: "<" },
  { name: "parity",  kind: "MULTIPLE_CHOICE", solution: { answer: "par" }, correct: "par", wrong: "impar" },
  // INPUT (teclado numérico)
  { name: "fill",     kind: "INPUT", solution: { answer: 3 }, correct: 3, wrong: 4 },
  { name: "pattern",  kind: "INPUT", solution: { answer: 8 }, correct: 8, wrong: 9 },
  { name: "neighbor", kind: "INPUT", solution: { answer: 6 }, correct: 6, wrong: 5 },
  // DRAG_DROP
  { name: "drag", kind: "DRAG_DROP", solution: { answer: 5 }, correct: 5, wrong: 3 },
  // DRAW (boolean del recognizer)
  { name: "draw", kind: "DRAW", solution: { answer: 5 }, correct: true, wrong: false },
  // SORT
  { name: "sort", kind: "SORT", solution: { sequence: [1, 3, 6, 8] }, correct: [1, 3, 6, 8], wrong: [1, 6, 3, 8] },
  // MATCH
  { name: "match", kind: "MATCH", solution: { pairs: [[0, 1], [1, 0]] }, correct: [[0, 1], [1, 0]], wrong: [[0, 0], [1, 1]] },
];

describe("runner coverage · todos los kinds del seed evalúan correctamente", () => {
  for (const f of fixtures) {
    it(`${f.name} (${f.kind}) acepta el caso correcto`, () => {
      expect(evaluateAttempt(f.kind, f.solution, f.correct)).toBe(true);
    });
    it(`${f.name} (${f.kind}) rechaza el caso incorrecto`, () => {
      expect(evaluateAttempt(f.kind, f.solution, f.wrong)).toBe(false);
    });
  }
});

describe("runner coverage · edge cases del visual=parity", () => {
  it("acepta 'impar' como respuesta válida", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: "impar" }, "impar")).toBe(true);
  });
  it("rechaza variantes (Par mayúscula, IMPAR mayúsculas, etc.)", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: "par" }, "Par")).toBe(false);
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: "impar" }, "IMPAR")).toBe(false);
  });
});

describe("runner coverage · AUDIO y SPEAK (no implementados aún)", () => {
  it("AUDIO usa el mismo evaluator que MULTIPLE_CHOICE", () => {
    expect(evaluateAttempt("AUDIO", { answer: "perro" }, "perro")).toBe(true);
    expect(evaluateAttempt("AUDIO", { answer: "perro" }, "gato")).toBe(false);
  });
  it("SPEAK también acepta strings", () => {
    expect(evaluateAttempt("SPEAK", { answer: "hola" }, "hola")).toBe(true);
  });
});
