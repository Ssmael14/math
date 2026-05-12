import { describe, it, expect } from "vitest";
import {
  makeRng,
  generateCount,
  generateFill,
  generateSubtract,
  generateCompare,
  generateParity,
  generatePattern,
  generateNeighbor,
  generateBatch,
} from "@/lib/learning/generators";

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
      const missing = ex.solution.answer as number;
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

describe("concordancia gramatical (género)", () => {
  it("COUNT usa 'Cuántos' o 'Cuántas' según género del item", () => {
    // Generamos varios y validamos que ningún caso emita 'Cuántas peces' o
    // 'Cuántos manzanas'. La forma correcta (Cuántos peces / Cuántas manzanas)
    // se verifica mirando la presencia del item en el prompt.
    const rng = makeRng(31);
    for (let i = 0; i < 60; i++) {
      const ex = generateCount(rng, 10);
      const p = ex.prompt;
      // Mismatch obvio: "Cuántas peces / cupcakes / pingüinos" (m).
      expect(p).not.toMatch(/Cuántas (peces|cupcakes|pingüinos)/);
      // Mismatch obvio: "Cuántos estrellas / manzanas / flores / abejas / mariposas / frutillas / tortugas" (f).
      expect(p).not.toMatch(/Cuántos (estrellas|manzanas|flores|abejas|mariposas|frutillas|tortugas)/);
    }
  });

  it("SUBTRACT no genera frases violentas con animales no comestibles", () => {
    const rng = makeRng(77);
    for (let i = 0; i < 60; i++) {
      const ex = generateSubtract(rng, 10);
      // Nunca debería decir "te comiste 3 mariposas" o similar.
      expect(ex.prompt).not.toMatch(/comiste \d+ (mariposas|abejas|tortugas|pingüinos|peces)/);
      // Y la pregunta final debe tener la concordancia correcta.
      const isMasculine = /\b(peces|cupcakes|pingüinos)\b/.test(ex.prompt);
      if (isMasculine) {
        expect(ex.prompt).toMatch(/¿Cuántos quedan\?/);
      } else {
        expect(ex.prompt).toMatch(/¿Cuántas quedan\?/);
      }
    }
  });
});

describe("generateCompare", () => {
  it("answer correcto según los valores", () => {
    const rng = makeRng(7);
    for (let i = 0; i < 50; i++) {
      const ex = generateCompare(rng, 10);
      const { left, right } = ex.payload as { left: number; right: number };
      const expected = left > right ? ">" : left < right ? "<" : "=";
      expect(ex.solution.answer).toBe(expected);
    }
  });
  it("topic refleja el rango", () => {
    expect(generateCompare(makeRng(1), 5).topic).toBe("comparar-hasta-5");
    expect(generateCompare(makeRng(1), 10).topic).toBe("comparar-hasta-10");
  });
});

describe("generateParity", () => {
  it("answer es 'par' o 'impar' según el valor", () => {
    const rng = makeRng(33);
    for (let i = 0; i < 50; i++) {
      const ex = generateParity(rng, 10);
      const { value } = ex.payload as { value: number };
      const expected = value % 2 === 0 ? "par" : "impar";
      expect(ex.solution.answer).toBe(expected);
    }
  });
});

describe("generatePattern", () => {
  it("answer extiende la serie con paso constante", () => {
    const rng = makeRng(55);
    for (let i = 0; i < 50; i++) {
      const ex = generatePattern(rng, 10);
      const { visible, step } = ex.payload as { visible: number[]; step: number };
      const expected = visible[visible.length - 1] + step;
      expect(ex.solution.answer).toBe(expected);
    }
  });
  it("paso siempre 1 ó 2", () => {
    const rng = makeRng(2);
    for (let i = 0; i < 30; i++) {
      const ex = generatePattern(rng, 10);
      const step = (ex.payload as { step: number }).step;
      expect([1, 2]).toContain(step);
    }
  });
  it("la secuencia completa nunca excede max", () => {
    const rng = makeRng(99);
    for (let i = 0; i < 30; i++) {
      const ex = generatePattern(rng, 10);
      const ans = ex.solution.answer as number;
      expect(ans).toBeLessThanOrEqual(10);
    }
  });
});

describe("generateNeighbor", () => {
  it("antes/después coincide con la dirección", () => {
    const rng = makeRng(17);
    for (let i = 0; i < 50; i++) {
      const ex = generateNeighbor(rng, 10);
      const { value, direction } = ex.payload as { value: number; direction: "before" | "after" };
      const expected = direction === "before" ? value - 1 : value + 1;
      expect(ex.solution.answer).toBe(expected);
    }
  });
  it("nunca produce answer = 0 (no tiene sentido pedagógico)", () => {
    const rng = makeRng(101);
    for (let i = 0; i < 50; i++) {
      const ex = generateNeighbor(rng, 10);
      expect(ex.solution.answer as number).toBeGreaterThanOrEqual(1);
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

  it("respeta el mix (sólo COUNT visuals cuando mix lo pide)", () => {
    const out = generateBatch({
      seed: 1, count: 20, max: 10,
      mix: { count: 1, fill: 0, subtract: 0, compare: 0, parity: 0, pattern: 0, neighbor: 0, drag: 0 },
    });
    // Todos deben ser MULTIPLE_CHOICE con visual="count".
    expect(out.every((e) => e.kind === "MULTIPLE_CHOICE")).toBe(true);
    expect(out.every((e) => e.payload.visual === "count")).toBe(true);
  });

  it("con todos los pesos activos, emite los 3 kinds genéricos", () => {
    const out = generateBatch({ seed: 7, count: 200, max: 10 });
    const kinds = new Set(out.map((e) => e.kind));
    // Tenemos: MULTIPLE_CHOICE (count/subtract/compare/parity), INPUT
    // (fill/pattern/neighbor) y DRAG_DROP (drag). Esperamos los 3.
    expect(kinds.size).toBe(3);
    expect(kinds.has("MULTIPLE_CHOICE")).toBe(true);
    expect(kinds.has("INPUT")).toBe(true);
    expect(kinds.has("DRAG_DROP")).toBe(true);
  });

  it("variedad de visuals al usar el mix default", () => {
    const out = generateBatch({ seed: 11, count: 200, max: 10 });
    const visuals = new Set(out.map((e) => e.payload.visual));
    // Esperamos al menos 5 de los 8 visuals (count/subtract/fill/compare/
    // parity/pattern/neighbor/drag) — algunos seeds pueden no emitir alguno.
    expect(visuals.size).toBeGreaterThanOrEqual(5);
  });

  it("mix vacío devuelve []", () => {
    const out = generateBatch({
      seed: 1, count: 10, max: 5,
      mix: { count: 0, fill: 0, subtract: 0, compare: 0, parity: 0, pattern: 0, neighbor: 0, drag: 0 },
    });
    expect(out).toEqual([]);
  });
});
