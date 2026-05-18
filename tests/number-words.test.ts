import { describe, it, expect } from "vitest";
import { NUMBER_WORDS, numberWord } from "../lib/learning/number-words";

describe("numberWord", () => {
  it("mapea 1..20 a su palabra (1-based)", () => {
    expect(numberWord(1)).toBe("uno");
    expect(numberWord(5)).toBe("cinco");
    expect(numberWord(20)).toBe("veinte");
    expect(NUMBER_WORDS).toHaveLength(20);
  });

  it("cae al dígito fuera de rango", () => {
    expect(numberWord(21)).toBe("21");
    expect(numberWord(0)).toBe("0");
  });
});
