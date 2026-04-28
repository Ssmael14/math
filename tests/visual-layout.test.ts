import { describe, it, expect } from "vitest";
import { countCols, countSizeCls } from "@/lib/visual-layout";

describe("countCols", () => {
  it("counts chicos van todos en una fila", () => {
    expect(countCols(1)).toBe(1);
    expect(countCols(2)).toBe(2);
    expect(countCols(3)).toBe(3);
  });

  it("4 va 2x2", () => {
    expect(countCols(4)).toBe(2);
  });

  it("5-6 va en 3 cols", () => {
    expect(countCols(5)).toBe(3);
    expect(countCols(6)).toBe(3);
  });

  it("7-8 va en 4 cols", () => {
    expect(countCols(7)).toBe(4);
    expect(countCols(8)).toBe(4);
  });

  it("9 va 3x3", () => {
    expect(countCols(9)).toBe(3);
  });

  it("10+ va en 5 cols", () => {
    expect(countCols(10)).toBe(5);
    expect(countCols(15)).toBe(5);
  });
});

describe("countSizeCls", () => {
  it("counts chicos usan tamaño grande", () => {
    expect(countSizeCls(1)).toContain("text-5xl");
    expect(countSizeCls(4)).toContain("text-5xl");
  });

  it("counts grandes bajan el tamaño", () => {
    expect(countSizeCls(10)).toContain("text-2xl");
  });

  it("brackets monotónicamente decrecientes", () => {
    // Cada bracket nunca es más grande que el anterior — monotonía simple.
    const sizes = [1, 4, 5, 6, 7, 9, 10, 15].map(countSizeCls);
    // Comparamos por el "text-Xxl" mobile.
    const px = (cls: string) => {
      const m = cls.match(/text-(\d)xl/);
      return m ? Number(m[1]) : 0;
    };
    for (let i = 1; i < sizes.length; i++) {
      expect(px(sizes[i])).toBeLessThanOrEqual(px(sizes[i - 1]));
    }
  });
});
