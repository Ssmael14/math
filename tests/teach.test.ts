import { describe, it, expect } from "vitest";
import {
  isTeachKind,
  gradedCount,
  parseTeach,
  stripTeach,
  precedingTeach,
} from "../lib/learning/teach";

const TEACH_PAYLOAD = {
  teach: {
    beats: [{ emoji: "🍎", text: "Una manzana", repeat: 3 }],
    tryIt: { emoji: "🍎", count: 3, text: "Toca", successText: "¡Bien!" },
  },
};

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
        tryIt: { emoji: "🍎", count: 3, text: "Toca", successText: "¡Bien!" },
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
        beats: [{ emoji: "🍓", text: "Fresa" }],
        tryIt: { emoji: "🍓", count: "tres", text: "x", successText: "y" },
      },
    });
    expect(c).not.toBeNull();
    expect(c!.tryIt).toBeUndefined();
  });
});

describe("stripTeach", () => {
  it("saca solo los pasos TEACH y conserva el orden", () => {
    const steps = [
      { kind: "TEACH", payload: TEACH_PAYLOAD },
      { kind: "MULTIPLE_CHOICE" },
      { kind: "DRAW" },
    ];
    const out = stripTeach(steps);
    expect(out.map((s) => s.kind)).toEqual(["MULTIPLE_CHOICE", "DRAW"]);
  });

  it("no toca secuencias sin TEACH (unidades procedurales)", () => {
    const steps = [{ kind: "INPUT" }, { kind: "MULTIPLE_CHOICE" }];
    expect(stripTeach(steps)).toHaveLength(2);
  });
});

describe("precedingTeach", () => {
  const steps = [
    { kind: "TEACH", payload: TEACH_PAYLOAD },
    { kind: "MULTIPLE_CHOICE" },
    { kind: "DRAW" },
  ];

  it("devuelve el Momento Lumi previo al ejercicio fallado", () => {
    const c = precedingTeach(steps, 2);
    expect(c).not.toBeNull();
    expect(c!.beats[0].emoji).toBe("🍎");
  });

  it("devuelve null si no hay TEACH antes (unidad procedural)", () => {
    const proc = [{ kind: "INPUT" }, { kind: "MULTIPLE_CHOICE" }];
    expect(precedingTeach(proc, 1)).toBeNull();
  });

  it("devuelve null en el primer paso (no hay nada antes)", () => {
    expect(precedingTeach(steps, 0)).toBeNull();
  });

  it("devuelve null si el TEACH previo está mal formado", () => {
    const bad = [{ kind: "TEACH", payload: { teach: {} } }, { kind: "DRAW" }];
    expect(precedingTeach(bad, 1)).toBeNull();
  });
});
