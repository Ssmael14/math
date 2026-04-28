import { describe, it, expect } from "vitest";
import {
  applyReview,
  gradeQuality,
  INITIAL_SRS,
  isMastered,
  MASTERY_THRESHOLD,
  nextReviewDate,
} from "@/lib/srs";

describe("gradeQuality", () => {
  it("correcto sin errores → 5", () => {
    expect(gradeQuality({ correct: true, priorWrongs: 0, solutionShown: false })).toBe(5);
  });

  it("correcto tras 1 error → 4", () => {
    expect(gradeQuality({ correct: true, priorWrongs: 1, solutionShown: false })).toBe(4);
  });

  it("correcto tras 2+ errores → 3", () => {
    expect(gradeQuality({ correct: true, priorWrongs: 2, solutionShown: false })).toBe(3);
    expect(gradeQuality({ correct: true, priorWrongs: 5, solutionShown: false })).toBe(3);
  });

  it("incorrecto sin solución vista → 2", () => {
    expect(gradeQuality({ correct: false, priorWrongs: 0, solutionShown: false })).toBe(2);
  });

  it("incorrecto con solución vista → 1", () => {
    expect(gradeQuality({ correct: false, priorWrongs: 2, solutionShown: true })).toBe(1);
  });
});

describe("applyReview", () => {
  it("primera review buena (q=5) → interval 1, reps 1, ef sube", () => {
    const next = applyReview(INITIAL_SRS, 5);
    expect(next.repetitions).toBe(1);
    expect(next.interval).toBe(1);
    expect(next.easeFactor).toBeGreaterThan(INITIAL_SRS.easeFactor);
  });

  it("segunda review buena → interval 6", () => {
    const after1 = applyReview(INITIAL_SRS, 5);
    const after2 = applyReview(after1, 5);
    expect(after2.repetitions).toBe(2);
    expect(after2.interval).toBe(6);
  });

  it("tercera review buena → interval crece geométricamente", () => {
    const after1 = applyReview(INITIAL_SRS, 5);
    const after2 = applyReview(after1, 5);
    const after3 = applyReview(after2, 5);
    expect(after3.repetitions).toBe(3);
    expect(after3.interval).toBeGreaterThan(after2.interval);
  });

  it("una respuesta mala (q<3) resetea las repeticiones", () => {
    let s = applyReview(INITIAL_SRS, 5);
    s = applyReview(s, 5);
    s = applyReview(s, 5); // reps=3
    s = applyReview(s, 1); // reset
    expect(s.repetitions).toBe(0);
    expect(s.interval).toBe(1);
  });

  it("ease factor nunca baja de 1.3", () => {
    let s = INITIAL_SRS;
    for (let i = 0; i < 20; i++) s = applyReview(s, 0);
    expect(s.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("masteryLevel sube con aciertos y baja con fallos", () => {
    const good = applyReview(INITIAL_SRS, 5);
    expect(good.masteryLevel).toBeGreaterThan(0);

    const bad = applyReview(good, 1);
    expect(bad.masteryLevel).toBeLessThan(good.masteryLevel);
  });

  it("masteryLevel se mantiene en [0, 1]", () => {
    let s = INITIAL_SRS;
    for (let i = 0; i < 30; i++) s = applyReview(s, 5);
    expect(s.masteryLevel).toBe(1);

    for (let i = 0; i < 30; i++) s = applyReview(s, 0);
    expect(s.masteryLevel).toBe(0);
  });

  it("calidad fuera de rango se clampea (q=10 trata como 5)", () => {
    const a = applyReview(INITIAL_SRS, 10);
    const b = applyReview(INITIAL_SRS, 5);
    expect(a).toEqual(b);
  });
});

describe("nextReviewDate", () => {
  it("suma `interval` días al hoy", () => {
    const now = new Date(Date.UTC(2026, 3, 10, 12, 0, 0)); // 10 abril
    const state = { ...INITIAL_SRS, interval: 6 };
    const next = nextReviewDate(state, now);
    expect(next.getUTCDate()).toBe(16);
    expect(next.getUTCMonth()).toBe(3); // sigue siendo abril
  });

  it("rolea correctamente a fin de mes", () => {
    const now = new Date(Date.UTC(2026, 3, 28, 12, 0, 0)); // 28 abril
    const state = { ...INITIAL_SRS, interval: 5 };
    const next = nextReviewDate(state, now);
    // 28 + 5 = 33 → 3 de mayo
    expect(next.getUTCDate()).toBe(3);
    expect(next.getUTCMonth()).toBe(4);
  });

  it("interval 0 devuelve mismo día", () => {
    const now = new Date(Date.UTC(2026, 3, 28));
    const next = nextReviewDate(INITIAL_SRS, now);
    expect(next.toISOString()).toBe(now.toISOString());
  });
});

describe("isMastered", () => {
  it("usa el threshold 0.8", () => {
    expect(isMastered(MASTERY_THRESHOLD)).toBe(true);
    expect(isMastered(0.79)).toBe(false);
    expect(isMastered(1)).toBe(true);
  });
});
