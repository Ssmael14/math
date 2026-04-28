import { describe, it, expect } from "vitest";
import {
  makeRng,
  generateCount,
  generateFill,
  generateSubtract,
  generateBatch,
} from "@/lib/generators";

describe("makeRng", () => {
  it("es determinístico para el mismo seed", () => {
    const a = makeRng(42);
    const b = makeRng(42);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });

  it("seeds distintos producen secuencias distintas", () => {
    const a = makeRng(1);
    const b = makeRng(2);
    expect(a()).not.toBe(b());
  });

  it("genera valores en [0, 1)", () => {
    const r = makeRng(123);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generateCount", () => {
  it("count es 1..max y solution coincide con count", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 50; i++) {
      const ex = generateCount(rng, 10);
      const count = ex.payload.count as number;
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(10);
      expect(ex.solution.answer).toBe(count);
    }
  });

  it("incluye hints y explanation", () => {
    const ex = generateCount(makeRng(1), 5);
    expect(ex.hints.length).toBeGreaterThan(0);
    expect(ex.explanation).toContain(String(ex.solution.answer));
  });

  it("topic refleja el rango", () => {
    expect(generateCount(makeRng(1), 5).topic).toBe("contar-hasta-5");
    expect(generateCount(makeRng(1), 10).topic).toBe("contar-hasta-10");
  });
});

describe("generateFill", () => {
  it("a + missing = result, todos en rango", () => {
    const rng = makeRng(11);
    for (let i = 0; i < 50; i++) {
      const ex = generateFill(rng, 10);
      const a = ex.payload.a as number;
      const result = ex.payload.result as number;
      const missing = ex.solution.answer;
      expect(a + missing).toBe(result);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
      expect(missing).toBeGreaterThanOrEqual(1);
    }
  });

  it("nunca produce missing = 0 (sería trivial)", () => {
    const rng = makeRng(99);
    for (let i = 0; i < 30; i++) {
      const ex = generateFill(rng, 10);
      expect(ex.solution.answer).toBeGreaterThan(0);
    }
  });
});

describe("generateSubtract", () => {
  it("total - removed = answer; ambos en rango y sin negativos", () => {
    const rng = makeRng(13);
    for (let i = 0; i < 50; i++) {
      const ex = generateSubtract(rng, 10);
      const total = ex.payload.total as number;
      const removed = ex.payload.removed as number;
      expect(total - removed).toBe(ex.solution.answer);
      expect(removed).toBeGreaterThanOrEqual(1);
      expect(removed).toBeLessThan(total);
      expect(ex.solution.answer).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("generateBatch", () => {
  it("genera el count exacto pedido", () => {
    expect(generateBatch({ seed: 1, count: 30, max: 10 })).toHaveLength(30);
  });

  it("es determinístico bajo el mismo seed", () => {
    const a = generateBatch({ seed: 42, count: 10, max: 10 });
    const b = generateBatch({ seed: 42, count: 10, max: 10 });
    expect(a).toEqual(b);
  });

  it("respeta el mix (sólo COUNT cuando mix lo dice)", () => {
    const out = generateBatch({
      seed: 1, count: 20, max: 10,
      mix: { count: 1, fill: 0, subtract: 0 },
    });
    expect(out.every((e) => e.kind === "COUNT")).toBe(true);
  });
});
