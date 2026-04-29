import { describe, it, expect } from "vitest";
import { evaluateAttempt } from "@/lib/evaluate";

describe("evaluateAttempt · COUNT/DRAG/SUBTRACT/FILL", () => {
  it("acierto cuando response === answer", () => {
    expect(evaluateAttempt("COUNT", { answer: 5 }, 5)).toBe(true);
    expect(evaluateAttempt("FILL", { answer: 3 }, 3)).toBe(true);
  });

  it("rechaza valor incorrecto", () => {
    expect(evaluateAttempt("COUNT", { answer: 5 }, 4)).toBe(false);
  });

  it("rechaza tipo incorrecto", () => {
    expect(evaluateAttempt("COUNT", { answer: 5 }, "5")).toBe(false);
    expect(evaluateAttempt("COUNT", { answer: 5 }, null)).toBe(false);
  });
});

describe("evaluateAttempt · TRACE", () => {
  it("acepta sólo response === true", () => {
    expect(evaluateAttempt("TRACE", { digit: 5 }, true)).toBe(true);
    expect(evaluateAttempt("TRACE", { digit: 5 }, false)).toBe(false);
    expect(evaluateAttempt("TRACE", { digit: 5 }, "true")).toBe(false);
  });
});

describe("evaluateAttempt · ORDER", () => {
  it("acierto con secuencia exacta", () => {
    expect(evaluateAttempt("ORDER", { order: [1, 3, 6, 8] }, [1, 3, 6, 8])).toBe(true);
  });

  it("rechaza cuando el orden está mal", () => {
    expect(evaluateAttempt("ORDER", { order: [1, 3, 6, 8] }, [1, 6, 3, 8])).toBe(false);
  });

  it("rechaza cuando faltan o sobran elementos", () => {
    expect(evaluateAttempt("ORDER", { order: [1, 3, 6, 8] }, [1, 3, 6])).toBe(false);
    expect(evaluateAttempt("ORDER", { order: [1, 3, 6, 8] }, [1, 3, 6, 8, 9])).toBe(false);
  });

  it("rechaza response que no sea array", () => {
    expect(evaluateAttempt("ORDER", { order: [1, 2] }, "1,2")).toBe(false);
  });
});

describe("evaluateAttempt · MATCH", () => {
  it("acepta pares correctos sin importar el orden", () => {
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

  it("rechaza si la solución no tiene pairs", () => {
    expect(evaluateAttempt("MATCH", {}, [[0, 1]])).toBe(false);
  });
});

describe("evaluateAttempt · COMPARE", () => {
  it("acepta el símbolo correcto", () => {
    expect(evaluateAttempt("COMPARE", { answer: ">" }, ">")).toBe(true);
    expect(evaluateAttempt("COMPARE", { answer: "<" }, "<")).toBe(true);
    expect(evaluateAttempt("COMPARE", { answer: "=" }, "=")).toBe(true);
  });
  it("rechaza el símbolo incorrecto", () => {
    expect(evaluateAttempt("COMPARE", { answer: ">" }, "<")).toBe(false);
  });
  it("rechaza response que no sea un símbolo válido", () => {
    expect(evaluateAttempt("COMPARE", { answer: ">" }, "mayor")).toBe(false);
    expect(evaluateAttempt("COMPARE", { answer: ">" }, 1)).toBe(false);
  });
});

describe("evaluateAttempt · PARITY", () => {
  it("acepta par/impar correcto", () => {
    expect(evaluateAttempt("PARITY", { answer: "par" }, "par")).toBe(true);
    expect(evaluateAttempt("PARITY", { answer: "impar" }, "impar")).toBe(true);
  });
  it("rechaza el opuesto", () => {
    expect(evaluateAttempt("PARITY", { answer: "par" }, "impar")).toBe(false);
  });
  it("rechaza valores fuera del enum", () => {
    expect(evaluateAttempt("PARITY", { answer: "par" }, "pares")).toBe(false);
    expect(evaluateAttempt("PARITY", { answer: "par" }, true)).toBe(false);
  });
});

describe("evaluateAttempt · PATTERN y NEIGHBOR", () => {
  it("PATTERN compara number === answer", () => {
    expect(evaluateAttempt("PATTERN", { answer: 7 }, 7)).toBe(true);
    expect(evaluateAttempt("PATTERN", { answer: 7 }, 6)).toBe(false);
  });
  it("NEIGHBOR compara number === answer", () => {
    expect(evaluateAttempt("NEIGHBOR", { answer: 4 }, 4)).toBe(true);
    expect(evaluateAttempt("NEIGHBOR", { answer: 4 }, "4")).toBe(false);
  });
});

describe("evaluateAttempt · SPEED y kinds desconocidos", () => {
  it("SPEED siempre falso (no implementado)", () => {
    expect(evaluateAttempt("SPEED", { answer: 1 }, 1)).toBe(false);
  });
});
