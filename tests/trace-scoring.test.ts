import { describe, it, expect } from "vitest";
import { scoreTrace, starsFromTraceScore } from "@/lib/learning/trace-scoring";

describe("scoreTrace", () => {
  it("máscara vacía → 0, no ok", () => {
    const r = scoreTrace({ maskCount: 0, insideCount: 0, outsideCount: 0 });
    expect(r.ok).toBe(false);
    expect(r.score).toBe(0);
  });

  it("cobertura total sin spill → 3 estrellas", () => {
    const r = scoreTrace({ maskCount: 100, insideCount: 100, outsideCount: 0 });
    expect(r.coverage).toBe(1);
    expect(r.spill).toBe(0);
    expect(r.stars).toBe(3);
    expect(r.ok).toBe(true);
  });

  it("buena cobertura con poco spill sigue siendo aceptable", () => {
    // cubrió 75% y un 10% se fue afuera
    const r = scoreTrace({ maskCount: 100, insideCount: 75, outsideCount: 8 });
    expect(r.stars).toBeGreaterThanOrEqual(1);
    expect(r.ok).toBe(true);
  });

  it("garabato: mucho spill hunde el score aunque cubra", () => {
    // cubrió todo pero pintó muchísimo afuera (rayó toda la pantalla)
    const r = scoreTrace({ maskCount: 100, insideCount: 100, outsideCount: 400 });
    expect(r.spill).toBeGreaterThan(0.7);
    expect(r.stars).toBe(0);
    expect(r.ok).toBe(false);
  });

  it("cobertura pobre → 0 estrellas", () => {
    const r = scoreTrace({ maskCount: 100, insideCount: 20, outsideCount: 0 });
    expect(r.coverage).toBe(0.2);
    expect(r.stars).toBe(0);
    expect(r.ok).toBe(false);
  });

  it("coverage se capea a 1 aunque insideCount exceda maskCount", () => {
    const r = scoreTrace({ maskCount: 100, insideCount: 250, outsideCount: 0 });
    expect(r.coverage).toBe(1);
  });
});

describe("starsFromTraceScore", () => {
  it("brackets", () => {
    expect(starsFromTraceScore(0.85)).toBe(3);
    expect(starsFromTraceScore(0.8)).toBe(3);
    expect(starsFromTraceScore(0.7)).toBe(2);
    expect(starsFromTraceScore(0.62)).toBe(2);
    expect(starsFromTraceScore(0.5)).toBe(1);
    expect(starsFromTraceScore(0.42)).toBe(1);
    expect(starsFromTraceScore(0.41)).toBe(0);
    expect(starsFromTraceScore(0)).toBe(0);
  });
});
