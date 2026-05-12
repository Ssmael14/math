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
  it("incorrecto sin solución → 2", () => {
    expect(gradeQuality({ correct: false, priorWrongs: 0, solutionShown: false })).toBe(2);
  });
  it("incorrecto con solución → 1", () => {
    expect(gradeQuality({ correct: false, priorWrongs: 2, solutionShown: true })).toBe(1);
  });
});

describe("applyReview", () => {
  it("primera review buena (q=5): reps=1, masteryLevel sube", () => {
    const { state, intervalDays } = applyReview(INITIAL_SRS, 5);
    expect(state.repetitions).toBe(1);
    expect(state.masteryLevel).toBeGreaterThan(0);
    expect(intervalDays).toBe(2);
  });

  it("segunda review buena (q=5): reps=2, interval=4", () => {
    const { state: a } = applyReview(INITIAL_SRS, 5);
    const { state: b, intervalDays } = applyReview(a, 5);
    expect(b.repetitions).toBe(2);
    expect(intervalDays).toBe(4);
  });

  it("intervalo crece exponencialmente con repeticiones", () => {
    let s = INITIAL_SRS;
    const intervals: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = applyReview(s, 5);
      s = r.state;
      intervals.push(r.intervalDays);
    }
    expect(intervals).toEqual([2, 4, 8, 16, 32]);
  });

  it("una respuesta mala (q<3) resetea repeticiones e interval=1", () => {
    let s = INITIAL_SRS;
    s = applyReview(s, 5).state;
    s = applyReview(s, 5).state;
    const bad = applyReview(s, 1);
    expect(bad.state.repetitions).toBe(0);
    expect(bad.intervalDays).toBe(1);
  });

  it("masteryLevel sube con aciertos y baja con fallos", () => {
    const good = applyReview(INITIAL_SRS, 5).state;
    expect(good.masteryLevel).toBeGreaterThan(0);
    const bad = applyReview(good, 1).state;
    expect(bad.masteryLevel).toBeLessThan(good.masteryLevel);
  });

  it("masteryLevel cap en 1 con muchos aciertos", () => {
    let s = INITIAL_SRS;
    for (let i = 0; i < 30; i++) s = applyReview(s, 5).state;
    expect(s.masteryLevel).toBe(1);
  });

  it("masteryLevel piso en 0 con muchos fallos", () => {
    let s = INITIAL_SRS;
    for (let i = 0; i < 30; i++) s = applyReview(s, 0).state;
    expect(s.masteryLevel).toBe(0);
  });

  it("intervalo se capea a 60 días", () => {
    let s = INITIAL_SRS;
    for (let i = 0; i < 20; i++) s = applyReview(s, 5).state;
    const last = applyReview(s, 5);
    expect(last.intervalDays).toBeLessThanOrEqual(60);
  });
});

describe("nextReviewDate", () => {
  it("suma `intervalDays` al hoy", () => {
    const now = new Date(Date.UTC(2026, 3, 10, 12, 0, 0));
    const next = nextReviewDate(6, now);
    expect(next.getUTCDate()).toBe(16);
    expect(next.getUTCMonth()).toBe(3);
  });

  it("rolea correctamente a fin de mes", () => {
    const now = new Date(Date.UTC(2026, 3, 28, 12, 0, 0));
    const next = nextReviewDate(5, now);
    expect(next.getUTCDate()).toBe(3);
    expect(next.getUTCMonth()).toBe(4);
  });

  it("intervalDays 0 devuelve mismo día", () => {
    const now = new Date(Date.UTC(2026, 3, 28));
    const next = nextReviewDate(0, now);
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
