import { describe, it, expect } from "vitest";
import {
  normalizeStroke,
  similarity,
  matchesDigit,
  DIGIT_TEMPLATES,
  type Point,
} from "@/lib/gesture";

// Genera un trazo de N puntos a lo largo de una línea entre dos puntos.
function line(a: Point, b: Point, n = 30): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

// Círculo counter-clockwise empezando arriba (como se traza un "0").
function circle(cx: number, cy: number, r: number, n = 60): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 - (i / (n - 1)) * 2 * Math.PI;
    out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return out;
}

describe("normalizeStroke", () => {
  it("devuelve 64 puntos", () => {
    const s = normalizeStroke(line({ x: 0, y: 0 }, { x: 100, y: 100 }, 50));
    expect(s).toHaveLength(64);
  });

  it("trazos de menos de 2 puntos pasan sin tocar", () => {
    expect(normalizeStroke([{ x: 1, y: 1 }])).toEqual([{ x: 1, y: 1 }]);
  });

  it("bbox queda centrada en el origen", () => {
    const s = normalizeStroke(line({ x: 10, y: 10 }, { x: 90, y: 90 }, 40));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of s) {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    }
    expect(Math.abs(minX + maxX)).toBeLessThan(1e-6);
    expect(Math.abs(minY + maxY)).toBeLessThan(1e-6);
  });
});

describe("similarity", () => {
  it("dos trazos idénticos dan score ≈ 1", () => {
    const a = normalizeStroke(line({ x: 0, y: 0 }, { x: 100, y: 100 }, 50));
    const b = normalizeStroke(line({ x: 0, y: 0 }, { x: 100, y: 100 }, 50));
    expect(similarity(a, b)).toBeGreaterThan(0.99);
  });

  it("un círculo se parece más a otro círculo que a una línea", () => {
    const c1 = normalizeStroke(circle(50, 50, 30));
    const c2 = normalizeStroke(circle(20, 20, 15));
    const ln = normalizeStroke(line({ x: 0, y: 0 }, { x: 100, y: 0 }, 60));
    expect(similarity(c1, c2)).toBeGreaterThan(similarity(c1, ln));
  });
});

describe("DIGIT_TEMPLATES", () => {
  it("tiene templates para los 10 dígitos", () => {
    for (let i = 0; i <= 9; i++) {
      expect(DIGIT_TEMPLATES[i]).toBeDefined();
      expect(DIGIT_TEMPLATES[i].length).toBe(64);
    }
  });
});

describe("matchesDigit", () => {
  it("rechaza trazos demasiado cortos", () => {
    const tiny = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
    expect(matchesDigit(tiny, 1).ok).toBe(false);
  });

  it("rechaza un dígito que no existe", () => {
    expect(matchesDigit(line({ x: 0, y: 0 }, { x: 0, y: 100 }, 30), 99).ok).toBe(false);
  });

  it("acepta una línea vertical como '1'", () => {
    const stroke = line({ x: 50, y: 0 }, { x: 50, y: 100 }, 50);
    const r = matchesDigit(stroke, 1);
    expect(r.ok).toBe(true);
  });

  it("acepta un círculo como '0'", () => {
    const stroke = circle(50, 50, 40);
    const r = matchesDigit(stroke, 0);
    expect(r.ok).toBe(true);
  });

  it("una línea horizontal NO es un '1'", () => {
    const stroke = line({ x: 0, y: 50 }, { x: 100, y: 50 }, 50);
    expect(matchesDigit(stroke, 1).ok).toBe(false);
  });
});
