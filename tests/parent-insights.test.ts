import { describe, it, expect } from "vitest";
import {
  findWeakSpots,
  activeDays,
  avgExerciseTimeMs,
  type AttemptRow,
  type ExerciseLite,
} from "@/lib/analytics/parent-insights";

const ex: ExerciseLite[] = [
  { id: "a", prompt: "Sumá 2+3", kind: "DRAG" },
  { id: "b", prompt: "Contá estrellas", kind: "COUNT" },
  { id: "c", prompt: "Trazá 5", kind: "TRACE" },
];

const at = (id: string, correct: boolean, ms: number, when = new Date()): AttemptRow => ({
  exerciseId: id, correct, timeMs: ms, createdAt: when,
});

describe("findWeakSpots", () => {
  it("ignora ejercicios con menos de minAttempts", () => {
    const attempts = [at("a", false, 1000), at("a", false, 1000)]; // sólo 2
    expect(findWeakSpots(attempts, ex, { minAttempts: 3 })).toEqual([]);
  });

  it("ignora ejercicios con accuracy alta", () => {
    const attempts = [
      at("a", true, 1000), at("a", true, 1000), at("a", true, 1000),
      at("a", false, 1000),
    ]; // 25% error
    expect(findWeakSpots(attempts, ex, { minAttempts: 3, minErrorRate: 0.5 })).toEqual([]);
  });

  it("ordena por errorRate desc", () => {
    const attempts = [
      // a: 3/4 wrong (75%)
      at("a", false, 1000), at("a", false, 1000), at("a", false, 1000), at("a", true, 1000),
      // b: 2/4 wrong (50%)
      at("b", false, 1000), at("b", false, 1000), at("b", true, 1000), at("b", true, 1000),
    ];
    const out = findWeakSpots(attempts, ex, { minAttempts: 3, minErrorRate: 0.3 });
    expect(out.map((w) => w.exerciseId)).toEqual(["a", "b"]);
    expect(out[0].errorRate).toBeCloseTo(0.75);
    expect(out[1].errorRate).toBeCloseTo(0.5);
  });

  it("aplica el limit", () => {
    const attempts = [
      at("a", false, 1), at("a", false, 1), at("a", false, 1),
      at("b", false, 1), at("b", false, 1), at("b", false, 1),
      at("c", false, 1), at("c", false, 1), at("c", false, 1),
    ];
    expect(findWeakSpots(attempts, ex, { minAttempts: 3, minErrorRate: 0.3, limit: 2 })).toHaveLength(2);
  });

  it("agrega prompt y avgTimeMs", () => {
    const attempts = [
      at("a", false, 1000), at("a", false, 2000), at("a", false, 3000),
    ];
    const [w] = findWeakSpots(attempts, ex, { minAttempts: 3 });
    expect(w.prompt).toBe("Sumá 2+3");
    expect(w.avgTimeMs).toBe(2000);
  });

  it("ignora ejercicios sin definición", () => {
    const attempts = [at("zzz", false, 1), at("zzz", false, 1), at("zzz", false, 1)];
    expect(findWeakSpots(attempts, ex)).toEqual([]);
  });
});

describe("activeDays", () => {
  it("0 si no hay intentos", () => {
    expect(activeDays([], 7)).toBe(0);
  });

  it("cuenta días distintos en la ventana", () => {
    const now = new Date(Date.UTC(2026, 3, 28, 12, 0, 0));
    const day = (offset: number) => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - offset);
      return d;
    };
    const attempts = [
      at("a", true, 1, day(0)),
      at("a", true, 1, day(0)), // mismo día → no cuenta extra
      at("a", true, 1, day(1)),
      at("a", true, 1, day(3)),
    ];
    expect(activeDays(attempts, 7, now)).toBe(3);
  });

  it("ignora días fuera de la ventana", () => {
    const now = new Date(Date.UTC(2026, 3, 28, 12, 0, 0));
    const old = new Date(Date.UTC(2026, 0, 1, 12, 0, 0)); // hace meses
    expect(activeDays([at("a", true, 1, old)], 7, now)).toBe(0);
  });
});

describe("avgExerciseTimeMs", () => {
  it("0 cuando no hay intentos", () => {
    expect(avgExerciseTimeMs([])).toBe(0);
  });

  it("promedia los timeMs", () => {
    expect(avgExerciseTimeMs([at("a", true, 1000), at("a", true, 3000)])).toBe(2000);
  });
});
