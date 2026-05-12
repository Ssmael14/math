import { describe, it, expect } from "vitest";
import { computeNextStreak } from "@/lib/gamification/streak";

const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12, 0, 0));

describe("computeNextStreak", () => {
  it("primera jugada arranca en 1", () => {
    expect(computeNextStreak(0, null, day(2026, 4, 28))).toBe(1);
  });

  it("jugar el mismo día no cambia el streak", () => {
    expect(computeNextStreak(5, day(2026, 4, 28), day(2026, 4, 28))).toBe(5);
  });

  it("jugar al día siguiente suma 1", () => {
    expect(computeNextStreak(5, day(2026, 4, 27), day(2026, 4, 28))).toBe(6);
  });

  it("dejar pasar un día rompe el streak (vuelve a 1)", () => {
    expect(computeNextStreak(10, day(2026, 4, 26), day(2026, 4, 28))).toBe(1);
  });

  it("dejar pasar varios días rompe el streak", () => {
    expect(computeNextStreak(20, day(2026, 4, 1), day(2026, 4, 28))).toBe(1);
  });

  it("funciona cruzando cambio de mes", () => {
    expect(computeNextStreak(3, day(2026, 3, 31), day(2026, 4, 1))).toBe(4);
  });

  it("funciona cruzando cambio de año", () => {
    expect(computeNextStreak(7, day(2025, 12, 31), day(2026, 1, 1))).toBe(8);
  });
});
