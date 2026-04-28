import { describe, it, expect } from "vitest";
import {
  nextHintLevel,
  shouldAdvanceAfterWrong,
  pickHint,
  MAX_WRONG_BEFORE_SOLUTION,
} from "@/lib/hints";

describe("nextHintLevel", () => {
  it("0 errores no muestra nada", () => {
    expect(nextHintLevel(0)).toBe("none");
  });

  it("1 error muestra pista", () => {
    expect(nextHintLevel(1)).toBe("hint");
  });

  it("2 errores muestran solución", () => {
    expect(nextHintLevel(2)).toBe("solution");
  });

  it("más errores siguen mostrando solución", () => {
    expect(nextHintLevel(5)).toBe("solution");
  });

  it("número negativo se trata como 0", () => {
    expect(nextHintLevel(-1)).toBe("none");
  });
});

describe("shouldAdvanceAfterWrong", () => {
  it("no avanza con 0 o 1 error", () => {
    expect(shouldAdvanceAfterWrong(0)).toBe(false);
    expect(shouldAdvanceAfterWrong(1)).toBe(false);
  });

  it("avanza al alcanzar el umbral", () => {
    expect(shouldAdvanceAfterWrong(MAX_WRONG_BEFORE_SOLUTION)).toBe(true);
  });

  it("avanza si superó el umbral", () => {
    expect(shouldAdvanceAfterWrong(10)).toBe(true);
  });
});

describe("pickHint", () => {
  it("devuelve la primera pista cuando el nivel es hint", () => {
    expect(pickHint("hint", ["pista 1", "pista 2"])).toBe("pista 1");
  });

  it("devuelve null cuando el nivel no es hint", () => {
    expect(pickHint("none", ["pista 1"])).toBeNull();
    expect(pickHint("solution", ["pista 1"])).toBeNull();
  });

  it("devuelve null cuando no hay hints configuradas", () => {
    expect(pickHint("hint", null)).toBeNull();
    expect(pickHint("hint", undefined)).toBeNull();
    expect(pickHint("hint", [])).toBeNull();
  });
});
