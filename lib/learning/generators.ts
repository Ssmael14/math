// lib/generators.ts
// Generación procedural de ejercicios para Math. Funciones puras: dado un
// seed o parámetros, devuelven un payload listo para persistir como Exercise.
//
// El `kind` que emiten son los GENÉRICOS de la plataforma (MULTIPLE_CHOICE,
// INPUT, etc.). El `payload.visual` indica al renderer qué dibujar (count,
// subtract, compare…) — eso mantiene al engine agnóstico al dominio.

import type { ExerciseKind } from "@prisma/client";

export type GeneratedExercise = {
  kind: ExerciseKind;
  prompt: string;
  payload: Record<string, unknown>;
  solution: { answer: number | string; sequence?: (number | string)[]; pairs?: number[][] };
  hints: string[];
  explanation: string;
  topic: string;
  difficulty: 1 | 2 | 3;
};

// PRNG determinístico (mulberry32) para reproducibilidad en seeds y tests.
export function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function intBetween(rng: () => number, lo: number, hi: number): number {
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

type Item = {
  emoji: string;
  sing: string;
  plural: string;
  gender: "m" | "f";
  removalVerb: string;
};

const ITEMS: ReadonlyArray<Item> = [
  { emoji: "⭐", sing: "estrella",  plural: "estrellas",  gender: "f", removalVerb: "se apagaron" },
  { emoji: "🍎", sing: "manzana",   plural: "manzanas",   gender: "f", removalVerb: "comiste" },
  { emoji: "🐟", sing: "pez",       plural: "peces",      gender: "m", removalVerb: "se nadaron" },
  { emoji: "🌸", sing: "flor",      plural: "flores",     gender: "f", removalVerb: "regalaste" },
  { emoji: "🧁", sing: "cupcake",   plural: "cupcakes",   gender: "m", removalVerb: "comiste" },
  { emoji: "🐝", sing: "abeja",     plural: "abejas",     gender: "f", removalVerb: "se volaron" },
  { emoji: "🦋", sing: "mariposa",  plural: "mariposas",  gender: "f", removalVerb: "se volaron" },
  { emoji: "🍓", sing: "fresa",  plural: "fresas",  gender: "f", removalVerb: "comiste" },
  { emoji: "🐢", sing: "tortuga",   plural: "tortugas",   gender: "f", removalVerb: "se escondieron" },
  { emoji: "🐧", sing: "pingüino",  plural: "pingüinos",  gender: "m", removalVerb: "se zambulleron" },
];

function howMany(item: Item): string {
  return item.gender === "f" ? "Cuántas" : "Cuántos";
}

// =========================================================================
// "Contar" — MULTIPLE_CHOICE con visual="count"
// =========================================================================
export function generateCount(rng: () => number, max: number): GeneratedExercise {
  const item = pick(rng, ITEMS);
  const count = intBetween(rng, 1, max);
  return {
    kind: "MULTIPLE_CHOICE",
    prompt: `¿${howMany(item)} ${item.plural} hay?`,
    payload: { visual: "count", item: item.emoji, count },
    solution: { answer: count },
    hints: [
      `Apunta con el dedo a cada ${item.sing} mientras cuentas.`,
      count <= 5 ? "Son menos de cinco." : count <= 7 ? "Son más de cinco." : "Son cerca de diez.",
    ],
    explanation: `Hay ${count} ${count === 1 ? item.sing : item.plural}: cuenta uno por uno y vas a llegar a ${count}.`,
    topic: max <= 5 ? "contar-hasta-5" : "contar-hasta-10",
    difficulty: max <= 5 ? 1 : 2,
  };
}

// =========================================================================
// "Llenar el hueco" — INPUT (teclado numérico)
// =========================================================================
export function generateFill(rng: () => number, max: number): GeneratedExercise {
  const result = intBetween(rng, 2, max);
  const a = intBetween(rng, 1, result - 1);
  const missing = result - a;
  return {
    kind: "INPUT",
    prompt: `${a} + ? = ${result}`,
    payload: { visual: "fill", a, result },
    solution: { answer: missing },
    hints: [
      `¿Cuánto le falta al ${a} para llegar al ${result}?`,
      `Cuenta con los dedos desde el ${a} hasta el ${result}.`,
    ],
    explanation: `Falta ${missing}, porque ${a} + ${missing} = ${result}.`,
    topic: max <= 5 ? "sumas-hasta-5" : "sumas-hasta-10",
    difficulty: max <= 5 ? 2 : 3,
  };
}

// =========================================================================
// "Restar" — MULTIPLE_CHOICE con visual="subtract"
// =========================================================================
export function generateSubtract(rng: () => number, max: number): GeneratedExercise {
  const item = pick(rng, ITEMS);
  const total = intBetween(rng, 2, max);
  const removed = intBetween(rng, 1, total - 1);
  const remaining = total - removed;
  const reflexive = item.removalVerb.startsWith("se ");
  const verbPhrase = reflexive ? item.removalVerb : `te ${item.removalVerb}`;
  const howManyQ = item.gender === "f" ? "Cuántas" : "Cuántos";
  return {
    kind: "MULTIPLE_CHOICE",
    prompt: `Tenías ${total} ${item.plural} y ${verbPhrase} ${removed}. ¿${howManyQ} quedan?`,
    payload: { visual: "subtract", total, removed, item: item.emoji },
    solution: { answer: remaining },
    hints: [
      `Empieza desde ${total} y retrocedé ${removed}.`,
      "Tacha los que ya no están y cuenta los que quedan.",
    ],
    explanation: `${total} menos ${removed} son ${remaining} ${remaining === 1 ? item.sing : item.plural}.`,
    topic: max <= 5 ? "restas-hasta-5" : "restas-hasta-10",
    difficulty: max <= 5 ? 2 : 3,
  };
}

// =========================================================================
// "Comparar" — MULTIPLE_CHOICE con visual="compare", options = "<"/">"/"="
// =========================================================================
export function generateCompare(rng: () => number, max: number): GeneratedExercise {
  const wantEqual = rng() < 0.2;
  const left = intBetween(rng, 1, max);
  const right = wantEqual ? left : intBetween(rng, 1, max);
  let answer: ">" | "<" | "=";
  if (left === right) answer = "=";
  else if (left > right) answer = ">";
  else answer = "<";
  return {
    kind: "MULTIPLE_CHOICE",
    prompt: "¿Qué signo va entre los números?",
    payload: { visual: "compare", left, right },
    solution: { answer },
    hints: [
      "La boquita del cocodrilo apunta al número más grande 🐊.",
      `Piensa: ¿${left} es más, menos, o igual a ${right}?`,
    ],
    explanation:
      answer === "=" ? `${left} y ${right} son iguales.`
      : answer === ">" ? `${left} es mayor que ${right}.`
      : `${left} es menor que ${right}.`,
    topic: max <= 5 ? "comparar-hasta-5" : "comparar-hasta-10",
    difficulty: max <= 5 ? 1 : 2,
  };
}

// =========================================================================
// "Par o impar" — MULTIPLE_CHOICE con visual="parity"
// =========================================================================
export function generateParity(rng: () => number, max: number): GeneratedExercise {
  const value = intBetween(rng, 1, max);
  const answer: "par" | "impar" = value % 2 === 0 ? "par" : "impar";
  return {
    kind: "MULTIPLE_CHOICE",
    prompt: `¿El número ${value} es par o impar?`,
    payload: { visual: "parity", value },
    solution: { answer },
    hints: [
      "Si puedes agruparlos de a dos sin que sobre uno, es par.",
      "Los pares terminan en 0, 2, 4, 6 u 8.",
    ],
    explanation:
      answer === "par"
        ? `${value} es par: se puede repartir en parejas exactas.`
        : `${value} es impar: si lo repartes en parejas, queda uno sin par.`,
    topic: "par-impar",
    difficulty: 2,
  };
}

// =========================================================================
// "Serie" — INPUT (tipear el siguiente número)
// =========================================================================
export function generatePattern(rng: () => number, max: number): GeneratedExercise {
  const step = pick(rng, [1, 2] as const);
  const start = intBetween(rng, 1, Math.max(1, max - step * 3));
  const sequence = [start, start + step, start + step * 2, start + step * 3];
  const answer = sequence[sequence.length - 1];
  const visible = sequence.slice(0, -1);
  return {
    kind: "INPUT",
    prompt: "¿Qué número completa la serie?",
    payload: { visual: "pattern", visible, step },
    solution: { answer },
    hints: [
      `Mira la diferencia entre los números: van saltando de a ${step}.`,
      `El último que ves es ${visible[visible.length - 1]} — súmale ${step}.`,
    ],
    explanation: `La serie va de a ${step}: ${sequence.join(", ")}.`,
    topic: step === 1 ? "serie-de-1" : "serie-de-2",
    difficulty: step === 1 ? 1 : 2,
  };
}

// =========================================================================
// "Vecinos" — INPUT (antecesor o sucesor)
// =========================================================================
export function generateNeighbor(rng: () => number, max: number): GeneratedExercise {
  const direction: "before" | "after" = rng() < 0.5 ? "before" : "after";
  const value = direction === "before"
    ? intBetween(rng, 2, max)
    : intBetween(rng, 1, max - 1);
  const answer = direction === "before" ? value - 1 : value + 1;
  return {
    kind: "INPUT",
    prompt:
      direction === "before"
        ? `¿Qué número viene ANTES del ${value}?`
        : `¿Qué número viene DESPUÉS del ${value}?`,
    payload: { visual: "neighbor", value, direction },
    solution: { answer },
    hints: [
      direction === "before"
        ? `Cuenta hacia atrás desde ${value}.`
        : `Cuenta uno más después de ${value}.`,
      "Piensa en la fila de números: cada uno tiene un vecino antes y otro después.",
    ],
    explanation:
      direction === "before"
        ? `Antes del ${value} viene el ${answer}.`
        : `Después del ${value} viene el ${answer}.`,
    topic: "vecinos",
    difficulty: 1,
  };
}

// =========================================================================
// "Suma arrastrando" — DRAG_DROP
// =========================================================================
export function generateDrag(rng: () => number, max: number): GeneratedExercise {
  const item = pick(rng, ITEMS);
  const a = intBetween(rng, 1, Math.min(5, max - 1));
  const b = intBetween(rng, 1, max - a);
  const total = a + b;
  return {
    kind: "DRAG_DROP",
    prompt: `Arrastra los ${item.plural} a la canasta y cuenta: ${a} + ${b}`,
    payload: { visual: "drag", a, b, item: item.emoji },
    solution: { answer: total },
    hints: [
      `Muévelos a todos a la canasta, después cuenta.`,
      `Son ${a} más ${b}.`,
    ],
    explanation: `${a} + ${b} = ${total}.`,
    topic: max <= 5 ? "sumas-hasta-5" : "sumas-hasta-10",
    difficulty: max <= 5 ? 1 : 2,
  };
}

export type BatchMix = {
  count: number;
  fill: number;
  subtract: number;
  compare: number;
  parity: number;
  pattern: number;
  neighbor: number;
  drag: number;
};

const DEFAULT_MIX: BatchMix = {
  count: 0.18,
  fill: 0.16,
  subtract: 0.14,
  compare: 0.14,
  parity: 0.10,
  pattern: 0.10,
  neighbor: 0.10,
  drag: 0.08,
};

/**
 * Genera un batch determinístico de N ejercicios mezclando los generadores.
 * Las proporciones del mix se normalizan automáticamente.
 */
export function generateBatch({
  seed, count, max, mix = DEFAULT_MIX,
}: {
  seed: number;
  count: number;
  max: number;
  mix?: Partial<BatchMix>;
}): GeneratedExercise[] {
  const rng = makeRng(seed);
  const m: BatchMix = { ...DEFAULT_MIX, ...mix };
  const weights: Array<{ end: number; gen: (rng: () => number) => GeneratedExercise }> = [];
  let acc = 0;
  const add = (w: number, gen: (rng: () => number) => GeneratedExercise) => {
    if (w <= 0) return;
    acc += w;
    weights.push({ end: acc, gen });
  };
  add(m.count, (r) => generateCount(r, max));
  add(m.fill, (r) => generateFill(r, max));
  add(m.subtract, (r) => generateSubtract(r, max));
  add(m.compare, (r) => generateCompare(r, max));
  add(m.parity, (r) => generateParity(r, max));
  add(m.pattern, (r) => generatePattern(r, max));
  add(m.neighbor, (r) => generateNeighbor(r, max));
  add(m.drag, (r) => generateDrag(r, max));

  if (weights.length === 0 || acc === 0) return [];

  const out: GeneratedExercise[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng() * acc;
    const slot = weights.find((w) => r < w.end) ?? weights[weights.length - 1];
    out.push(slot.gen(rng));
  }
  return out;
}
