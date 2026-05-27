import { describe, it, expect } from "vitest";
import { evaluateAttempt } from "@/lib/learning/evaluate";

describe("evaluateAttempt · MULTIPLE_CHOICE / INPUT / AUDIO / SPEAK", () => {
  it("acepta number === answer", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: 5 }, 5)).toBe(true);
    expect(evaluateAttempt("INPUT", { answer: 3 }, 3)).toBe(true);
  });

  it("acepta string === answer (compare, parity, etc.)", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: "<" }, "<")).toBe(true);
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: "par" }, "par")).toBe(true);
  });

  it("rechaza valores incorrectos", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: 5 }, 4)).toBe(false);
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: ">" }, "<")).toBe(false);
  });

  it("rechaza tipos no soportados", () => {
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: 5 }, true)).toBe(false);
    expect(evaluateAttempt("MULTIPLE_CHOICE", { answer: 5 }, null)).toBe(false);
  });
});

describe("evaluateAttempt · DRAG_DROP", () => {
  it("compara con count numérico", () => {
    expect(evaluateAttempt("DRAG_DROP", { answer: 5 }, 5)).toBe(true);
    expect(evaluateAttempt("DRAG_DROP", { answer: 5 }, 3)).toBe(false);
  });

  it("compara grupos de clasificación sin depender del orden", () => {
    const solution = { groups: { red: ["apple", "cherry"], yellow: ["banana"] } };
    expect(evaluateAttempt("DRAG_DROP", solution, { groups: { red: ["cherry", "apple"], yellow: ["banana"] } })).toBe(true);
    expect(evaluateAttempt("DRAG_DROP", solution, { groups: { red: ["apple"], yellow: ["banana", "cherry"] } })).toBe(false);
  });

  it("compara partes como multiset", () => {
    expect(evaluateAttempt("DRAG_DROP", { total: 5, parts: [2, 3] }, { parts: [3, 2] })).toBe(true);
    expect(evaluateAttempt("DRAG_DROP", { total: 5, parts: [2, 3] }, { parts: [1, 4] })).toBe(false);
  });
});

describe("evaluateAttempt · DRAW", () => {
  it("acepta sólo response === true", () => {
    expect(evaluateAttempt("DRAW", { answer: 5 }, true)).toBe(true);
    expect(evaluateAttempt("DRAW", { answer: 5 }, false)).toBe(false);
    expect(evaluateAttempt("DRAW", { answer: 5 }, "true")).toBe(false);
  });
});

describe("evaluateAttempt · SORT", () => {
  it("acierto con secuencia exacta", () => {
    expect(evaluateAttempt("SORT", { sequence: [1, 3, 6, 8] }, [1, 3, 6, 8])).toBe(true);
  });
  it("orden mal", () => {
    expect(evaluateAttempt("SORT", { sequence: [1, 3, 6, 8] }, [1, 6, 3, 8])).toBe(false);
  });
  it("len distintos", () => {
    expect(evaluateAttempt("SORT", { sequence: [1, 3, 6] }, [1, 3, 6, 8])).toBe(false);
  });
  it("rechaza no-array", () => {
    expect(evaluateAttempt("SORT", { sequence: [1, 2] }, "1,2")).toBe(false);
  });
  it("acepta secuencias de ids string", () => {
    expect(evaluateAttempt("SORT", { sequence: ["small", "medium", "big"] }, ["small", "medium", "big"])).toBe(true);
  });
});

describe("evaluateAttempt · MATCH", () => {
  it("acepta pares sin importar orden", () => {
    const sol = { pairs: [[0, 1], [1, 0]] };
    expect(evaluateAttempt("MATCH", sol, [[0, 1], [1, 0]])).toBe(true);
    expect(evaluateAttempt("MATCH", sol, [[1, 0], [0, 1]])).toBe(true);
  });
  it("rechaza pares mal asignados", () => {
    const sol = { pairs: [[0, 1], [1, 0]] };
    expect(evaluateAttempt("MATCH", sol, [[0, 0], [1, 1]])).toBe(false);
  });
  it("rechaza cantidades distintas", () => {
    const sol = { pairs: [[0, 1], [1, 0]] };
    expect(evaluateAttempt("MATCH", sol, [[0, 1]])).toBe(false);
  });
  it("rechaza si solution no tiene pairs", () => {
    expect(evaluateAttempt("MATCH", {}, [[0, 1]])).toBe(false);
  });
});

describe("evaluateAttempt · AUDIO y SPEAK", () => {
  it("se comportan como MULTIPLE_CHOICE", () => {
    expect(evaluateAttempt("AUDIO", { answer: "rojo" }, "rojo")).toBe(true);
    expect(evaluateAttempt("SPEAK", { answer: "hola" }, "chau")).toBe(false);
  });
});
