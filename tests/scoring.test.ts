import { describe, it, expect } from "vitest";
import { computeStars, mondayOfWeek } from "@/lib/gamification/scoring";

describe("computeStars", () => {
  it("100% de aciertos = 3 estrellas", () => {
    expect(computeStars(5, 5)).toBe(3);
  });

  it("66%+ de aciertos = 2 estrellas", () => {
    expect(computeStars(4, 5)).toBe(2);
    expect(computeStars(2, 3)).toBe(2);
  });

  it("33-65% de aciertos = 1 estrella", () => {
    expect(computeStars(2, 5)).toBe(1);
    expect(computeStars(1, 3)).toBe(1);
  });

  it("menos del 33% = 0 estrellas", () => {
    expect(computeStars(1, 5)).toBe(0);
    expect(computeStars(0, 5)).toBe(0);
  });

  it("total <= 0 devuelve 0", () => {
    expect(computeStars(5, 0)).toBe(0);
    expect(computeStars(5, -1)).toBe(0);
  });

  it("clampa correct cuando viene fuera de rango", () => {
    expect(computeStars(99, 5)).toBe(3);
    expect(computeStars(-3, 5)).toBe(0);
  });
});

describe("mondayOfWeek", () => {
  it("devuelve el lunes de la misma semana (martes)", () => {
    // martes 2026-04-28 → lunes 2026-04-27
    const d = new Date(Date.UTC(2026, 3, 28, 15, 0, 0));
    const m = mondayOfWeek(d);
    expect(m.getUTCFullYear()).toBe(2026);
    expect(m.getUTCMonth()).toBe(3);
    expect(m.getUTCDate()).toBe(27);
  });

  it("para domingo devuelve el lunes anterior", () => {
    // domingo 2026-05-03 → lunes 2026-04-27
    const d = new Date(Date.UTC(2026, 4, 3, 15, 0, 0));
    const m = mondayOfWeek(d);
    expect(m.getUTCDate()).toBe(27);
    expect(m.getUTCMonth()).toBe(3);
  });

  it("para lunes devuelve el mismo lunes", () => {
    const d = new Date(Date.UTC(2026, 3, 27, 15, 0, 0));
    const m = mondayOfWeek(d);
    expect(m.getUTCDate()).toBe(27);
  });
});
