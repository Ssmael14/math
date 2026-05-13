import { describe, it, expect } from "vitest";
import {
  recentAccuracy,
  recommendMove,
  adjustLevel,
  MIN_WINDOW,
} from "@/lib/learning/difficulty";

const ok = { correct: true };
const fail = { correct: false };

describe("recentAccuracy", () => {
  it("0 intentos → 0", () => {
    expect(recentAccuracy([])).toBe(0);
  });

  it("todos correctos → 1", () => {
    expect(recentAccuracy([ok, ok, ok])).toBe(1);
  });

  it("todos incorrectos → 0", () => {
    expect(recentAccuracy([fail, fail, fail])).toBe(0);
  });

  it("considera sólo los últimos N intentos", () => {
    const old = Array(10).fill(fail);
    const recent = Array(5).fill(ok);
    expect(recentAccuracy([...old, ...recent], 5)).toBe(1);
  });
});

describe("recommendMove", () => {
  it("muy pocos intentos → KEEP", () => {
    expect(recommendMove([ok, ok, ok])).toBe("KEEP");
  });

  it("accuracy alta sostenida → UP", () => {
    expect(recommendMove(Array(MIN_WINDOW).fill(ok))).toBe("UP");
  });

  it("accuracy baja sostenida → DOWN", () => {
    expect(recommendMove(Array(MIN_WINDOW).fill(fail))).toBe("DOWN");
  });

  it("accuracy en zona media → KEEP", () => {
    // 5 de 10 = 50% queda entre 60 y 90 NO; queda <= 60 → DOWN.
    // Vamos a un caso 7/10 = 70% que está en la zona KEEP.
    const seven = [ok, ok, ok, ok, ok, ok, ok, fail, fail, fail];
    expect(recommendMove(seven, 10)).toBe("KEEP");
  });

  it("dos correctas y tres fallas (40%) → DOWN", () => {
    const w = [ok, ok, fail, fail, fail];
    expect(recommendMove(w, 5)).toBe("DOWN");
  });
});

describe("adjustLevel", () => {
  it("UP sube 1 nivel", () => {
    expect(adjustLevel(3, "UP")).toBe(4);
  });

  it("DOWN baja 1 nivel", () => {
    expect(adjustLevel(3, "DOWN")).toBe(2);
  });

  it("KEEP no cambia", () => {
    expect(adjustLevel(3, "KEEP")).toBe(3);
  });

  it("respeta el min", () => {
    expect(adjustLevel(1, "DOWN", { min: 1 })).toBe(1);
  });

  it("respeta el max", () => {
    expect(adjustLevel(10, "UP", { max: 10 })).toBe(10);
  });
});
