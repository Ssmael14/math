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
  solution: { answer: number };
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

/**
 * Genera un batch de N ejercicios usando los tres generadores en proporción
 * configurable. Determinístico bajo `seed` — útil en seed.ts.
 */
export function generateBatch({
  seed, count, max, mix = { count: 0.4, fill: 0.3, subtract: 0.3 },
}: {
  seed: number;
  count: number;
  max: number;
  mix?: { count: number; fill: number; subtract: number };
}): GeneratedExercise[] {
  const rng = makeRng(seed);
  const out: GeneratedExercise[] = [];
  const total = mix.count + mix.fill + mix.subtract;
  for (let i = 0; i < count; i++) {
    const r = rng() * total;
    if (r < mix.count) out.push(generateCount(rng, max));
    else if (r < mix.count + mix.fill) out.push(generateFill(rng, max));
    else out.push(generateSubtract(rng, max));
  }
  return out;
}
