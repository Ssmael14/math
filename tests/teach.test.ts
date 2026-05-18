import { describe, it, expect } from "vitest";
import { isTeachKind, gradedCount, parseTeach } from "../lib/learning/teach";

describe("isTeachKind", () => {
  it("solo TEACH es enseñanza", () => {
    expect(isTeachKind("TEACH")).toBe(true);
    expect(isTeachKind("MULTIPLE_CHOICE")).toBe(false);
    expect(isTeachKind("DRAW")).toBe(false);
  });
});

describe("gradedCount", () => {
  it("excluye los pasos TEACH del denominador", () => {
    expect(gradedCount(["TEACH", "MULTIPLE_CHOICE", "DRAW"])).toBe(2);
    expect(gradedCount(["MULTIPLE_CHOICE", "INPUT"])).toBe(2);
    expect(gradedCount(["TEACH"])).toBe(0);
    expect(gradedCount([])).toBe(0);
  });
});

describe("parseTeach", () => {
  it("acepta un payload bien formado con tryIt", () => {
    const c = parseTeach({
      teach: {
        beats: [{ emoji: "🍎", text: "Una manzana", repeat: 3 }],
        tryIt: { emoji: "🍎", count: 3, text: "Tocá", successText: "¡Bien!" },
      },
    });
    expect(c).not.toBeNull();
    expect(c!.beats).toHaveLength(1);
    expect(c!.beats[0].repeat).toBe(3);
    expect(c!.tryIt?.count).toBe(3);
  });

  it("normaliza repeat inválido a 1 y descarta beats malos", () => {
    const c = parseTeach({
      teach: {
        beats: [
          { emoji: "🐟", text: "ok", repeat: 999 },
          { emoji: "x" }, // sin text → descartado
          { text: "sin emoji" }, // sin emoji → descartado
        ],
      },
    });
    expect(c).not.toBeNull();
    expect(c!.beats).toHaveLength(1);
    expect(c!.beats[0].repeat).toBe(1);
    expect(c!.tryIt).toBeUndefined();
  });

  it("rechaza payloads sin beats válidos", () => {
    expect(parseTeach(null)).toBeNull();
    expect(parseTeach({})).toBeNull();
    expect(parseTeach({ teach: {} })).toBeNull();
    expect(parseTeach({ teach: { beats: [] } })).toBeNull();
    expect(parseTeach({ teach: { beats: [{ emoji: "🍎" }] } })).toBeNull();
  });

  it("ignora un tryIt mal formado pero conserva los beats", () => {
    const c = parseTeach({
      teach: {
        beats: [{ emoji: "🍓", text: "Frutilla" }],
        tryIt: { emoji: "🍓", count: "tres", text: "x", successText: "y" },
      },
    });
    expect(c).not.toBeNull();
    expect(c!.tryIt).toBeUndefined();
  });
});
