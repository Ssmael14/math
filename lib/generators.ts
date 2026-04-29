// lib/generators.ts
// Generación procedural de ejercicios. Funciones puras: dado un seed o
// parámetros, devuelven un payload listo para guardar como Exercise.
//
// Los generadores cubren COUNT, FILL y SUBTRACT — los tres tipos cuyo
// payload JSON está bien acotado y pueden generarse sin curaduría humana.
// Los otros tipos (TRACE, MATCH, ORDER) se siguen escribiendo a mano.

import type { ExerciseKind } from "@prisma/client";

export type GeneratedExercise = {
  kind: ExerciseKind;
  prompt: string;
  payload: Record<string, unknown>;
  /** answer puede ser number (mayoría) o string corto (COMPARE: "<"/">"/"=",
   *  PARITY: "par"/"impar"). */
  solution: { answer: number | string };
  hints: string[];
  explanation: string;
  /** "tag" pedagógico para agrupar — útil para crear lecciones temáticas. */
  topic: string;
  /** dificultad subjetiva 1-3, usable después con la dificultad adaptativa. */
  difficulty: 1 | 2 | 3;
};

// PRNG determinístico (mulberry32). Recibir un seed permite generar el
// mismo set de ejercicios de un build a otro — facilita debugging y tests.
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
  /** Concordancia gramatical: "f" → "cuántas / quedan", "m" → "cuántos / quedan". */
  gender: "m" | "f";
  /** Verbo en pasado para contextualizar la resta sin que suene violento.
   *  Algunos items se pueden comer ("comiste"), otros se vuelan ("se volaron"),
   *  otros se sacan a una caja ("guardaste"). */
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
  { emoji: "🍓", sing: "frutilla",  plural: "frutillas",  gender: "f", removalVerb: "comiste" },
  { emoji: "🐢", sing: "tortuga",   plural: "tortugas",   gender: "f", removalVerb: "se escondieron" },
  { emoji: "🐧", sing: "pingüino",  plural: "pingüinos",  gender: "m", removalVerb: "se zambulleron" },
];

/** "Cuántas" o "Cuántos" según el género gramatical. */
function howMany(item: Item): string {
  return item.gender === "f" ? "Cuántas" : "Cuántos";
}

// =========================================================================
// COUNT: ¿cuántos hay?
// =========================================================================
export function generateCount(rng: () => number, max: number): GeneratedExercise {
  const item = pick(rng, ITEMS);
  const count = intBetween(rng, 1, max);
  return {
    kind: "COUNT",
    prompt: `¿${howMany(item)} ${item.plural} hay?`,
    payload: { item: item.emoji, count },
    solution: { answer: count },
    hints: [
      `Apuntá con el dedo a cada ${item.sing} mientras contás.`,
      count <= 5 ? "Son menos de cinco." : count <= 7 ? "Son más de cinco." : "Son cerca de diez.",
    ],
    explanation: `Hay ${count} ${count === 1 ? item.sing : item.plural}: contá uno por uno y vas a llegar a ${count}.`,
    topic: max <= 5 ? "contar-hasta-5" : "contar-hasta-10",
    difficulty: max <= 5 ? 1 : 2,
  };
}

// =========================================================================
// FILL: a + ? = result   →  ¿qué sumando falta?
// =========================================================================
export function generateFill(rng: () => number, max: number): GeneratedExercise {
  const result = intBetween(rng, 2, max);
  const a = intBetween(rng, 1, result - 1);
  const missing = result - a;
  return {
    kind: "FILL",
    prompt: `${a} + ? = ${result}`,
    payload: { a, result },
    solution: { answer: missing },
    hints: [
      `¿Cuánto le falta al ${a} para llegar al ${result}?`,
      `Contá con los dedos desde el ${a} hasta el ${result}.`,
    ],
    explanation: `Falta ${missing}, porque ${a} + ${missing} = ${result}.`,
    topic: max <= 5 ? "sumas-hasta-5" : "sumas-hasta-10",
    difficulty: max <= 5 ? 2 : 3,
  };
}

// =========================================================================
// SUBTRACT: tenés N, sacás K, ¿cuántos quedan?
// =========================================================================
export function generateSubtract(rng: () => number, max: number): GeneratedExercise {
  const item = pick(rng, ITEMS);
  const total = intBetween(rng, 2, max);
  const removed = intBetween(rng, 1, total - 1);
  const remaining = total - removed;
  // Si el verbo es reflexivo ("se volaron") no anteponemos "te". Si es
  // transitivo ("comiste", "regalaste") sí.
  const reflexive = item.removalVerb.startsWith("se ");
  const verbPhrase = reflexive ? item.removalVerb : `te ${item.removalVerb}`;
  const howManyQ = item.gender === "f" ? "Cuántas" : "Cuántos";
  return {
    kind: "SUBTRACT",
    prompt: `Tenías ${total} ${item.plural} y ${verbPhrase} ${removed}. ¿${howManyQ} quedan?`,
    payload: { total, removed, item: item.emoji },
    solution: { answer: remaining },
    hints: [
      `Empezá desde ${total} y retrocedé ${removed}.`,
      "Tachá los que ya no están y contá los que quedan.",
    ],
    explanation: `${total} menos ${removed} son ${remaining} ${remaining === 1 ? item.sing : item.plural}.`,
    topic: max <= 5 ? "restas-hasta-5" : "restas-hasta-10",
    difficulty: max <= 5 ? 2 : 3,
  };
}

// =========================================================================
// COMPARE: ¿qué número es mayor / menor / igual?
// =========================================================================
export function generateCompare(rng: () => number, max: number): GeneratedExercise {
  // Cada tanto elegimos `=` para asegurar que el niño vea casos de igualdad.
  const wantEqual = rng() < 0.2;
  const left = intBetween(rng, 1, max);
  const right = wantEqual ? left : intBetween(rng, 1, max);
  let answer: ">" | "<" | "=";
  if (left === right) answer = "=";
  else if (left > right) answer = ">";
  else answer = "<";
  return {
    kind: "COMPARE",
    prompt: "¿Qué signo va entre los números?",
    payload: { left, right },
    solution: { answer },
    hints: [
      "El boquita del cocodrilo apunta al número más grande 🐊.",
      `Pensá: ¿${left} es más, menos, o igual a ${right}?`,
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
// PARITY: ¿es par o impar?
// =========================================================================
export function generateParity(rng: () => number, max: number): GeneratedExercise {
  const value = intBetween(rng, 1, max);
  const answer: "par" | "impar" = value % 2 === 0 ? "par" : "impar";
  return {
    kind: "PARITY",
    prompt: `¿El número ${value} es par o impar?`,
    payload: { value },
    solution: { answer },
    hints: [
      "Si podés agruparlos de a dos sin que sobre uno, es par.",
      "Los pares terminan en 0, 2, 4, 6 u 8.",
    ],
    explanation:
      answer === "par"
        ? `${value} es par: se puede repartir en parejas exactas.`
        : `${value} es impar: si lo repartís en parejas, queda uno sin par.`,
    topic: "par-impar",
    difficulty: 2,
  };
}

// =========================================================================
// PATTERN: completá la serie. La regla es paso constante (de 1, 2, o 3).
// El hueco siempre va en la última posición — más simple visualmente para
// kids de 4-6 años.
// =========================================================================
export function generatePattern(rng: () => number, max: number): GeneratedExercise {
  const step = pick(rng, [1, 2] as const);
  // Calculamos un start tal que la secuencia de 4 elementos no exceda `max`.
  const start = intBetween(rng, 1, Math.max(1, max - step * 3));
  const sequence = [start, start + step, start + step * 2, start + step * 3];
  const missingIndex = sequence.length - 1; // siempre el último
  const answer = sequence[missingIndex];
  // El payload muestra los 3 primeros + un slot vacío.
  const visible = sequence.slice(0, missingIndex);
  return {
    kind: "PATTERN",
    prompt: "¿Qué número completa la serie?",
    payload: { visible, step },
    solution: { answer },
    hints: [
      `Mirá la diferencia entre los números: van saltando de a ${step}.`,
      `El último que ves es ${visible[visible.length - 1]} — sumále ${step}.`,
    ],
    explanation: `La serie va de a ${step}: ${sequence.join(", ")}.`,
    topic: step === 1 ? "serie-de-1" : "serie-de-2",
    difficulty: step === 1 ? 1 : 2,
  };
}

// =========================================================================
// NEIGHBOR: ¿qué número viene antes/después de N?
// =========================================================================
export function generateNeighbor(rng: () => number, max: number): GeneratedExercise {
  const direction: "before" | "after" = rng() < 0.5 ? "before" : "after";
  // Si es antecesor, evitar value=1 (no tiene predecesor positivo).
  const value = direction === "before"
    ? intBetween(rng, 2, max)
    : intBetween(rng, 1, max - 1);
  const answer = direction === "before" ? value - 1 : value + 1;
  return {
    kind: "NEIGHBOR",
    prompt:
      direction === "before"
        ? `¿Qué número viene ANTES del ${value}?`
        : `¿Qué número viene DESPUÉS del ${value}?`,
    payload: { value, direction },
    solution: { answer },
    hints: [
      direction === "before"
        ? `Contá hacia atrás desde ${value}.`
        : `Contá uno más después de ${value}.`,
      "Pensá en la fila de números: cada uno tiene un vecino antes y otro después.",
    ],
    explanation:
      direction === "before"
        ? `Antes del ${value} viene el ${answer}.`
        : `Después del ${value} viene el ${answer}.`,
    topic: "vecinos",
    difficulty: 1,
  };
}

/**
 * Mix con TODOS los kinds procedurales. Las proporciones por defecto se
 * eligieron para que un batch típico tenga variedad sin abusar de ningún
 * tipo. La suma se normaliza así no es necesario que las proporciones
 * sumen exactamente 1.
 */
export type BatchMix = {
  count: number;
  fill: number;
  subtract: number;
  compare: number;
  parity: number;
  pattern: number;
  neighbor: number;
};

const DEFAULT_MIX: BatchMix = {
  count: 0.20,
  fill: 0.18,
  subtract: 0.15,
  compare: 0.15,
  parity: 0.10,
  pattern: 0.12,
  neighbor: 0.10,
};

/**
 * Genera un batch de N ejercicios usando los siete generadores en proporción
 * configurable. Determinístico bajo `seed` — útil en seed.ts.
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
  // Normalizamos: weights acumulados sobre la suma total.
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

  if (weights.length === 0 || acc === 0) return [];

  const out: GeneratedExercise[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng() * acc;
    const slot = weights.find((w) => r < w.end) ?? weights[weights.length - 1];
    out.push(slot.gen(rng));
  }
  return out;
}
