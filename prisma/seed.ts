// prisma/seed.ts
// Corre con: npm run db:seed
//
// Currículo CURADO estilo Brilliant para Matemáticas "Primero" (4-6 años,
// pre-lectores). Principios:
//  - Un concepto por lección.
//  - Intuición primero: cada lección abre con un Momento Lumi (TEACH).
//  - Concreto → pictórico → abstracto; solo interacciones concretas
//    (contar tocando, arrastrar, sacar, comparar, trazar, emparejar,
//    ordenar). Se difiere el teclado numérico a niveles avanzados.
//  - Dificultad escalonada dentro de la lección (fácil → desafío).
//  - Espiral: lecciones nuevas repasan lo viejo en contexto nuevo.
//
// Reading + Shop + Achievements quedan igual. El generador procedural sigue
// en lib/learning/generators.ts por si se reusa, pero el path principal de
// Math ya no usa unidades aleatorias.

import { PrismaClient, ExerciseKind, EducationLevel, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type Beat = { emoji: string; repeat?: number; text: string };
type TryIt = { emoji: string; count: number; text: string; successText: string };
type Ex = Prisma.ExerciseCreateManyInput;
type Card = { id: string; emoji: string; label?: string; size?: number };
type SortItem = Card & { category: string };
type SortCategory = { id: string; label: string; emoji?: string };

// --- Builders: un ejercicio correcto por intención, sin repetir 18 líneas ---

function lumi(beats: Beat[], tryIt?: TryIt): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.TEACH,
    prompt: "",
    payload: { teach: { beats, tryIt } } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  };
}

function count(item: string, n: number, hint: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "Tocá cada uno y contá. ¿Cuántos hay?",
    payload: { visual: "count", item, count: n },
    solution: { answer: n },
    hints: [hint, "Tocá uno por uno, sin saltarte ninguno."],
    explanation: `Hay ${n}. El último número que decís es cuántos hay.`,
    difficulty: n <= 5 ? 1 : 2,
    xpReward: 5,
  };
}

function add(a: number, b: number, item: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: `Juntá ${a} y ${b} en el canasto. ¿Cuántos hay en total?`,
    payload: { visual: "drag", a, b, item },
    solution: { answer: a + b },
    hints: [`Juntá los ${a} y los ${b} en el canasto.`, "Después contá todo lo que hay adentro."],
    explanation: `${a} + ${b} = ${a + b}. Juntar dos grupos es sumar.`,
    difficulty: a + b <= 5 ? 1 : 2,
    xpReward: 7,
  };
}

function sub(total: number, removed: number, item: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: `Hay ${total}. Sacá ${removed}. ¿Cuántos quedan?`,
    payload: { visual: "subtract", total, removed, item },
    solution: { answer: total - removed },
    hints: [`Tocá ${removed} para sacarlos.`, "Después contá los que quedaron."],
    explanation: `${total} − ${removed} = ${total - removed}. Sacar es restar.`,
    difficulty: total <= 5 ? 1 : 2,
    xpReward: 7,
  };
}

function compare(left: number, right: number): Omit<Ex, "lessonId" | "order"> {
  const answer = left === right ? "=" : left > right ? ">" : "<";
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "¿Qué signo va en el medio?",
    payload: { visual: "compare", left, right },
    solution: { answer },
    hints: [
      "La boca del cocodrilo 🐊 se abre hacia el número más grande.",
      `¿${left} es más, menos o igual que ${right}?`,
    ],
    explanation:
      answer === "="
        ? `${left} y ${right} son iguales.`
        : answer === ">"
          ? `${left} es mayor que ${right}.`
          : `${left} es menor que ${right}.`,
    difficulty: Math.max(left, right) <= 5 ? 1 : 2,
    xpReward: 6,
  };
}

function trace(digit: number): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAW,
    prompt: `Trazá el número ${digit} con el dedo`,
    payload: { digit },
    solution: { answer: digit },
    hints: ["Seguí la guía despacito, sin levantar el dedo si no hace falta."],
    explanation: `Así se escribe el ${digit}. ¡Cada vez te sale mejor!`,
    difficulty: 2,
    xpReward: 6,
  };
}

function order(numbers: number[]): Omit<Ex, "lessonId" | "order"> {
  const sequence = [...numbers].sort((a, b) => a - b);
  return {
    kind: ExerciseKind.SORT,
    prompt: "Ordená de menor a mayor",
    payload: { numbers },
    solution: { sequence },
    hints: ["Primero el más chiquito.", "Cada número que sigue es uno más."],
    explanation: `En orden: ${sequence.join(", ")}.`,
    difficulty: numbers.length <= 3 ? 1 : 2,
    xpReward: 7,
  };
}

function match(
  groups: { item: string; count: number }[],
  options: number[],
): Omit<Ex, "lessonId" | "order"> {
  // pairs = [[grupoIdx, opciónIdx]] — la opción es el índice en `options`.
  const pairs = groups.map((g, i) => [i, options.indexOf(g.count)]);
  return {
    kind: ExerciseKind.MATCH,
    prompt: "Uní cada grupo con su número",
    payload: { groups, options },
    solution: { pairs },
    hints: ["Contá los de cada grupo.", "Después tocá su número."],
    explanation: "Cada grupo tiene tantas cosas como dice su número.",
    difficulty: 2,
    xpReward: 8,
  };
}

function sameMatch(
  prompt: string,
  left: Card[],
  right: Card[],
  explanation: string,
): Omit<Ex, "lessonId" | "order"> {
  const pairs = left.map((l, i) => [i, right.findIndex((r) => r.id === l.id)]);
  return {
    kind: ExerciseKind.MATCH,
    prompt,
    payload: { visual: "same-match", left, right },
    solution: { pairs },
    hints: ["Buscá el mismo dibujo.", "Tocá una tarjeta y después su pareja."],
    explanation,
    difficulty: 1,
    xpReward: 6,
  };
}

function sortByAttribute(
  attribute: string,
  items: SortItem[],
  categories: SortCategory[],
  prompt = "Poné cada cosa en su canasta.",
  difficulty = 1,
): Omit<Ex, "lessonId" | "order"> {
  const groups = Object.fromEntries(categories.map((c) => [c.id, items.filter((i) => i.category === c.id).map((i) => i.id)]));
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt,
    payload: { visual: "sort-attribute", attribute, items, categories },
    solution: { groups },
    hints: ["Mirá una característica a la vez.", "Si se parece a la canasta, va ahí."],
    explanation: "Clasificar es juntar las cosas que comparten una característica.",
    difficulty,
    xpReward: difficulty === 1 ? 6 : 7,
  };
}

function compareObjects(
  attribute: string,
  left: Card,
  right: Card,
  answer: "izquierda" | "derecha" | "igual",
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: attribute === "same" ? "¿Son iguales?" : "Tocá el que corresponde.",
    payload: { visual: "compare-attribute", attribute, left, right, options: ["izquierda", "derecha", "igual"] },
    solution: { answer },
    hints: ["Miralos despacio.", "Compará solo lo que Lumi pidió."],
    explanation:
      answer === "igual"
        ? "Son iguales en esta comparación."
        : answer === "izquierda"
          ? "El de la izquierda cumple la pista."
          : "El de la derecha cumple la pista.",
    difficulty: 1,
    xpReward: 6,
  };
}

function orderObjects(
  attribute: string,
  objects: Card[],
  sequence: string[],
  difficulty = 1,
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.SORT,
    prompt: "Ordená las tarjetas.",
    payload: { visual: "order-objects", attribute, objects },
    solution: { sequence },
    hints: ["Empezá por el más pequeño o corto.", "Después buscá el que sigue."],
    explanation: "Ordenar es poner las cosas en una secuencia.",
    difficulty,
    xpReward: difficulty === 1 ? 7 : 8,
  };
}

function patternNext(
  sequence: string[],
  options: string[],
  answer: string,
  difficulty = 1,
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "¿Qué sigue en el patrón?",
    payload: { visual: "pattern-next", sequence, options },
    solution: { answer },
    hints: ["Decí el patrón en voz baja.", "Buscá qué parte se repite."],
    explanation: `El patrón se repite. Sigue ${answer}.`,
    difficulty,
    xpReward: difficulty === 1 ? 6 : 8,
  };
}

function subitise(
  item: string,
  n: number,
  arrangement: string,
  options: number[],
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "Mirá rápido. ¿Cuántos viste?",
    payload: { visual: "flash-quantity", item, count: n, arrangement, durationMs: 1200, options },
    solution: { answer: n },
    hints: ["No cuentes uno por uno. Mirá el grupo completo."],
    explanation: `Viste ${n}. A veces podés reconocer el grupo completo.`,
    difficulty: n <= 3 ? 1 : 2,
    xpReward: 7,
  };
}

function conservation(item: string, n: number, beforeLayout: string, afterLayout: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "El mago movió las cosas. ¿Ahora hay más, menos o igual?",
    payload: { visual: "conservation", item, count: n, beforeLayout, afterLayout, options: ["más", "menos", "igual"] },
    solution: { answer: "igual" },
    hints: ["No desapareció nada.", "Contá si querés comprobar."],
    explanation: "Mover las cosas no cambia cuántas hay.",
    difficulty: n <= 4 ? 1 : 2,
    xpReward: 7,
  };
}

function compareGroups(
  left: { item: string; count: number },
  right: { item: string; count: number },
): Omit<Ex, "lessonId" | "order"> {
  const answer = left.count === right.count ? "igual" : left.count > right.count ? "izquierda" : "derecha";
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "¿Dónde hay más?",
    payload: { visual: "compare-groups", left, right, options: ["izquierda", "derecha", "igual"] },
    solution: { answer },
    hints: ["Mirá los dos grupos.", "Podés tocar y contar para comprobar."],
    explanation: answer === "igual" ? "Hay la misma cantidad." : `Hay más en la ${answer}.`,
    difficulty: Math.max(left.count, right.count) <= 5 ? 1 : 2,
    xpReward: 7,
  };
}

function partWhole(total: number, item: string, parts: number[]): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: `Separá el grupo en ${parts[0]} y ${parts[1]}.`,
    payload: { visual: "part-whole", total, item, parts },
    solution: { total, parts },
    hints: ["Poné algunas cosas en una parte y otras en la otra.", "Las dos partes juntas forman el grupo completo."],
    explanation: `${parts[0]} y ${parts[1]} forman ${total}. Un grupo puede separarse en partes.`,
    difficulty: total <= 4 ? 1 : 2,
    xpReward: 8,
  };
}

async function lesson(
  unitId: string,
  data: { slug: string; title: string; order: number; xpReward: number; minutes: number },
  steps: Omit<Ex, "lessonId" | "order">[],
) {
  const l = await prisma.lesson.create({
    data: {
      unitId,
      slug: data.slug,
      title: data.title,
      order: data.order,
      xpReward: data.xpReward,
      estimatedMinutes: data.minutes,
    },
  });
  await prisma.exercise.createMany({
    data: steps.map((s, i) => ({ ...s, lessonId: l.id, order: i })) as Ex[],
  });
}

async function main() {
  console.log("🌱 Seeding Learn Platform (currículo curado)...");

  await prisma.attempt.deleteMany();
  await prisma.mastery.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.learningPath.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.childAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.weeklyXP.deleteMany();

  // ============================================================
  // SUBJECTS
  // ============================================================
  const mathSubject = await prisma.subject.create({
    data: {
      slug: "math", name: "Matemáticas",
      description: "Clasificar, descubrir patrones, contar, comparar, juntar y sacar — con juegos visuales.",
      icon: "🧮", color: "sun", order: 1, isActive: true,
    },
  });
  const readingSubject = await prisma.subject.create({
    data: {
      slug: "reading", name: "Lectura",
      description: "Letras, palabras y comprensión.",
      icon: "📖", color: "mint", order: 2, isActive: true,
    },
  });
  await prisma.subject.createMany({
    data: [
      { slug: "science", name: "Ciencias", description: "Naturaleza, espacio y experimentos.", icon: "🔬", color: "sky", order: 3, isActive: false },
      { slug: "english", name: "Inglés", description: "Vocabulario, pronunciación y frases.", icon: "🗣️", color: "lilac", order: 4, isActive: false },
    ],
  });

  // ============================================================
  // MATH · Inicial · Aventura con Lumi
  // ============================================================
  const primary1 = await prisma.learningPath.create({
    data: {
      subjectId: mathSubject.id,
      slug: "math-primary-1",
      name: "Inicial · Aventura con Lumi",
      description: "Clasificar, descubrir patrones, contar, comparar, juntar y sacar — paso a paso con Lumi.",
      level: EducationLevel.INITIAL,
      difficulty: 1,
      isPremium: false,
      order: 1,
    },
  });

  const u1 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "antes-de-contar",
      title: "Antes de contar",
      description: "Emparejar, clasificar, comparar, ordenar y descubrir patrones.",
      order: 1, color: "peach", icon: "🧩",
    },
  });

  await lesson(u1.id, { slug: "emparejar-iguales", title: "Emparejar iguales", order: 1, xpReward: 22, minutes: 5 }, [
    lumi([{ emoji: "🍎", repeat: 2, text: "En el mercado de los monitos, las cosas iguales pueden ir juntas." }], { emoji: "🍌", count: 2, text: "Tocá las dos bananas iguales.", successText: "¡Son pareja!" }),
    sameMatch("Uní cada fruta con su pareja.", [{ id: "apple", emoji: "🍎" }, { id: "banana", emoji: "🍌" }, { id: "grape", emoji: "🍇" }], [{ id: "banana", emoji: "🍌" }, { id: "grape", emoji: "🍇" }, { id: "apple", emoji: "🍎" }], "Cada fruta encontró otra igual."),
    sameMatch("Uní cada animal con su pareja.", [{ id: "cat", emoji: "🐱" }, { id: "dog", emoji: "🐶" }, { id: "fish", emoji: "🐟" }], [{ id: "fish", emoji: "🐟" }, { id: "cat", emoji: "🐱" }, { id: "dog", emoji: "🐶" }], "Emparejar es buscar lo que es igual."),
    sortByAttribute("type", [{ id: "apple", emoji: "🍎", category: "fruits" }, { id: "cat", emoji: "🐱", category: "animals" }, { id: "banana", emoji: "🍌", category: "fruits" }, { id: "dog", emoji: "🐶", category: "animals" }], [{ id: "fruits", label: "Frutas", emoji: "🍎" }, { id: "animals", label: "Animales", emoji: "🐱" }], "Poné frutas con frutas y animales con animales."),
  ]);

  await lesson(u1.id, { slug: "clasificar-por-color", title: "Canastas de colores", order: 2, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Cada canasta recibe cosas de su color." }], { emoji: "🍎", count: 1, text: "Tocá la fruta roja.", successText: "¡Rojo!" }),
    sortByAttribute("color", [{ id: "apple", emoji: "🍎", category: "red" }, { id: "banana", emoji: "🍌", category: "yellow" }, { id: "pear", emoji: "🍐", category: "green" }, { id: "cherry", emoji: "🍒", category: "red" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }, { id: "green", label: "Verdes", emoji: "🟢" }], "Poné cada fruta en su color."),
    sortByAttribute("color", [{ id: "rose", emoji: "🌹", category: "red" }, { id: "sunflower", emoji: "🌻", category: "yellow" }, { id: "tulip", emoji: "🌷", category: "red" }, { id: "blossom", emoji: "🌼", category: "yellow" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }], "Poné cada flor en su canasta."),
    sortByAttribute("color", [{ id: "strawberry", emoji: "🍓", category: "red" }, { id: "lemon", emoji: "🍋", category: "yellow" }, { id: "tomato", emoji: "🍅", category: "red" }, { id: "leaf", emoji: "🍃", category: "other" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }, { id: "other", label: "Otra", emoji: "✨" }], "Hay un objeto que no va con los dos colores.", 2),
  ]);

  await lesson(u1.id, { slug: "clasificar-por-tamano-forma", title: "Pequeños, grandes y formas", order: 3, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🔍", repeat: 1, text: "Miramos una característica a la vez: tamaño, forma o color." }], { emoji: "⭐", count: 1, text: "Tocá la estrella para mirar mejor.", successText: "¡Detective listo!" }),
    sortByAttribute("size", [{ id: "small-star", emoji: "⭐", label: "pequeña", category: "small" }, { id: "big-star", emoji: "🌟", label: "grande", category: "big" }, { id: "small-flower", emoji: "🌸", label: "pequeña", category: "small" }, { id: "big-flower", emoji: "🌺", label: "grande", category: "big" }], [{ id: "small", label: "Pequeños" }, { id: "big", label: "Grandes" }]),
    sortByAttribute("shape", [{ id: "circle", emoji: "🔵", category: "circle" }, { id: "triangle", emoji: "🔺", category: "triangle" }, { id: "square", emoji: "🟩", category: "square" }, { id: "circle2", emoji: "🟡", category: "circle" }], [{ id: "circle", label: "Círculos" }, { id: "triangle", label: "Triángulos" }, { id: "square", label: "Cuadrados" }], "Poné cada forma con su familia."),
    compareObjects("size", { id: "small", emoji: "🧸", label: "pequeño", size: 1 }, { id: "big", emoji: "🧸", label: "grande", size: 2 }, "derecha"),
  ]);

  await lesson(u1.id, { slug: "ordenar-objetos", title: "El tren de los tamaños", order: 4, xpReward: 26, minutes: 6 }, [
    lumi([{ emoji: "🚂", repeat: 1, text: "El tren sale si los vagones están ordenados." }], { emoji: "🚃", count: 3, text: "Tocá los vagones del tren.", successText: "¡A ordenar!" }),
    orderObjects("size", [{ id: "small", emoji: "🚃", size: 1 }, { id: "big", emoji: "🚃", size: 3 }, { id: "medium", emoji: "🚃", size: 2 }], ["small", "medium", "big"]),
    orderObjects("height", [{ id: "one", emoji: "🌱", size: 1 }, { id: "four", emoji: "🌳", size: 4 }, { id: "two", emoji: "🌿", size: 2 }, { id: "three", emoji: "🌲", size: 3 }], ["one", "two", "three", "four"], 2),
    orderObjects("length", [{ id: "s", emoji: "✏️", size: 1 }, { id: "xl", emoji: "✏️", size: 5 }, { id: "m", emoji: "✏️", size: 3 }, { id: "l", emoji: "✏️", size: 4 }, { id: "xs", emoji: "✏️", size: 2 }], ["s", "xs", "m", "l", "xl"], 2),
  ]);

  await lesson(u1.id, { slug: "detectives-de-patrones", title: "Detectives de patrones", order: 5, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🧩", repeat: 1, text: "Un patrón es algo que se repite." }], { emoji: "🍎", count: 2, text: "Tocá el patrón: manzana, banana.", successText: "¡Patrón encontrado!" }),
    patternNext(["🍎", "🍌", "🍎", "🍌"], ["🍎", "🍌", "🍇"], "🍎"),
    patternNext(["🔴", "🔴", "🟡", "🟡", "🔴", "🔴"], ["🔴", "🟡", "🔵"], "🟡"),
    patternNext(["🐱", "🐶", "🐟", "🐱", "🐶", "🐟"], ["🐱", "🐶", "🐟"], "🐱", 2),
    patternNext(["⭐", "⭐", "🌙", "🌙", "⭐", "⭐", "🌙"], ["⭐", "🌙", "☀️"], "🌙", 2),
  ]);

  const u2 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "contar-tocando-1-5",
      title: "Contar tocando 1-5",
      description: "Contar uno por uno, en orden, y descubrir que el último número dice cuántos hay.",
      order: 2, color: "mint", icon: "🔢",
    },
  });

  await lesson(u2.id, { slug: "uno-a-uno", title: "Un toque, un número", order: 1, xpReward: 22, minutes: 5 }, [
    lumi([{ emoji: "☝️", repeat: 1, text: "Tocamos una cosa y decimos un número. Una cosa, un toque." }], { emoji: "🍎", count: 2, text: "Tocá dos manzanas, una por una.", successText: "¡Un toque para cada una!" }),
    count("🐟", 2, "Tocá un pez y decí uno. Tocá otro y decí dos."),
    count("⭐", 3, "Una estrella, un número."),
    match([{ item: "🍎", count: 1 }, { item: "⭐", count: 2 }, { item: "🐟", count: 3 }], [2, 3, 1]),
  ]);

  await lesson(u2.id, { slug: "orden-estable", title: "La canción de los números", order: 2, xpReward: 22, minutes: 5 }, [
    lumi([{ emoji: "🎵", repeat: 1, text: "La canción siempre va igual: uno, dos, tres, cuatro, cinco." }], { emoji: "🎵", count: 1, text: "Tocá la nota para cantar.", successText: "¡Cantamos en orden!" }),
    order([2, 1, 3]),
    order([3, 1, 4, 2]),
    order([4, 2, 5, 1, 3]),
  ]);

  await lesson(u2.id, { slug: "cardinalidad", title: "El último dice cuántos", order: 3, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🏁", repeat: 1, text: "Cuando terminás de contar, el último número dice cuántos hay." }], { emoji: "⭐", count: 4, text: "Tocá cuatro estrellas.", successText: "¡El último fue cuatro!" }),
    count("🍎", 4, "El último número te dice la cantidad."),
    count("🐟", 5, "Terminá de contar y escuchá el último número."),
    match([{ item: "⭐", count: 3 }, { item: "🍎", count: 4 }, { item: "🐟", count: 5 }], [5, 3, 4]),
  ]);

  await lesson(u2.id, { slug: "contar-desde-cualquier-lado", title: "Contar desde cualquier lado", order: 4, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🔄", repeat: 1, text: "Podés empezar por otro lado y sigue habiendo la misma cantidad." }], { emoji: "🍓", count: 4, text: "Tocá las frutillas en el orden que quieras.", successText: "¡Siguen siendo cuatro!" }),
    count("🍓", 4, "Podés empezar por la izquierda."),
    count("🍓", 4, "Podés empezar por la derecha."),
    conservation("🍓", 4, "row", "spread"),
  ]);

  await lesson(u2.id, { slug: "repaso-contar-1-5", title: "Repaso 1 al 5", order: 5, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🖐️", repeat: 1, text: "Repasamos hasta cinco con ojos, dedos y toques." }], { emoji: "⭐", count: 5, text: "Tocá cinco estrellas.", successText: "¡Llegaste a cinco!" }),
    count("🍎", 5, "Tocá uno por uno."),
    match([{ item: "🍎", count: 1 }, { item: "🐟", count: 3 }, { item: "⭐", count: 5 }], [5, 1, 3]),
    order([3, 1, 5, 2, 4]),
    compareGroups({ item: "🍎", count: 2 }, { item: "🍎", count: 4 }),
  ]);

  const u3 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "contar-hasta-10",
      title: "Contar hasta 10",
      description: "Seguir contando, reconocer grupos y ordenar hasta 10.",
      order: 3, color: "sky", icon: "🔟",
    },
  });

  await lesson(u3.id, { slug: "contar-6-7-8", title: "Contar 6, 7, 8", order: 1, xpReward: 26, minutes: 6 }, [
    lumi([{ emoji: "🐟", repeat: 5, text: "Ya llegamos a cinco. Ahora seguimos: seis, siete, ocho." }], { emoji: "🐟", count: 6, text: "Tocá seis peces.", successText: "¡Seis!" }),
    count("🍎", 6, "Uno más que cinco."),
    count("⭐", 7, "Seguí después de seis."),
    count("🐟", 8, "Contá despacio hasta el final."),
  ]);

  await lesson(u3.id, { slug: "contar-9-10", title: "Contar 9 y 10", order: 2, xpReward: 26, minutes: 6 }, [
    lumi([{ emoji: "🔟", repeat: 1, text: "Diez es como tener las dos manos llenas." }], { emoji: "⭐", count: 9, text: "Tocá nueve estrellas.", successText: "¡Nueve!" }),
    count("🐟", 9, "Uno menos que diez."),
    count("🍎", 10, "Las dos manos llenas."),
    match([{ item: "⭐", count: 7 }, { item: "🐟", count: 9 }, { item: "🍎", count: 10 }], [10, 7, 9]),
  ]);

  await lesson(u3.id, { slug: "ordenar-hasta-10", title: "Ordenar hasta 10", order: 3, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🪜", repeat: 1, text: "Los números suben como una escalera." }], { emoji: "🪜", count: 1, text: "Tocá la escalera.", successText: "¡Subimos!" }),
    order([6, 7, 5]),
    order([8, 6, 7, 9]),
    order([10, 6, 8, 7, 9]),
  ]);

  await lesson(u3.id, { slug: "tarjetas-de-puntos", title: "Tarjetas de puntos", order: 4, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🎲", repeat: 1, text: "Las tarjetas de puntos ayudan a ver cantidades." }], { emoji: "•", count: 5, text: "Tocá los puntos.", successText: "¡Puntos listos!" }),
    match([{ item: "•", count: 6 }, { item: "•", count: 7 }, { item: "•", count: 8 }], [8, 6, 7]),
    match([{ item: "•", count: 9 }, { item: "•", count: 10 }, { item: "•", count: 6 }], [10, 6, 9]),
    subitise("•", 5, "dice", [4, 5, 6, 3]),
  ]);

  await lesson(u3.id, { slug: "repaso-hasta-10", title: "Repaso hasta 10", order: 5, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🎒", repeat: 1, text: "Guardamos todo lo aprendido hasta diez." }], { emoji: "⭐", count: 10, text: "Tocá diez estrellas.", successText: "¡Diez!" }),
    count("🍓", 8, "Contá sin saltarte ninguna."),
    compareGroups({ item: "🍎", count: 6 }, { item: "🍎", count: 9 }),
    order([7, 10, 6, 8, 9]),
    match([{ item: "🐟", count: 6 }, { item: "⭐", count: 8 }, { item: "🍎", count: 10 }], [8, 10, 6]),
  ]);

  const u4 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "sentido-numerico",
      title: "Sentido numérico",
      description: "Ver cantidades, comparar grupos y descubrir partes dentro de un todo.",
      order: 4, color: "lilac", icon: "🧠",
    },
  });

  await lesson(u4.id, { slug: "cuantos-viste", title: "¿Cuántos viste?", order: 1, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "👀", repeat: 1, text: "A veces podés ver cuántos hay sin contar uno por uno." }], { emoji: "⭐", count: 3, text: "Mirá el grupo completo.", successText: "¡Lo viste rápido!" }),
    subitise("●", 2, "pair", [1, 2, 3, 4]),
    subitise("●", 3, "triangle", [2, 3, 4, 5]),
    subitise("●", 4, "square", [3, 4, 5, 6]),
    subitise("●", 5, "dice", [4, 5, 6, 3]),
  ]);

  await lesson(u4.id, { slug: "dados-y-dominos", title: "Dados y dominós", order: 2, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🎲", repeat: 1, text: "Los dados y dominós muestran cantidades de muchas formas." }], { emoji: "●", count: 3, text: "Mirá tres puntos.", successText: "¡Tres!" }),
    subitise("●", 3, "line", [2, 3, 4, 5]),
    subitise("●", 3, "triangle", [2, 3, 4, 1]),
    subitise("●", 4, "square", [3, 4, 5, 6]),
    subitise("●", 5, "dice", [4, 5, 6, 7]),
  ]);

  await lesson(u4.id, { slug: "mago-de-las-cantidades", title: "El mago de las cantidades", order: 3, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🪄", repeat: 1, text: "Mover las cosas no cambia cuántas hay." }], { emoji: "🍎", count: 3, text: "Tocá las manzanas antes y después.", successText: "¡Siguen iguales!" }),
    conservation("🍎", 3, "close", "spread"),
    conservation("⭐", 4, "row", "circle"),
    conservation("🐟", 5, "compact", "spread"),
  ]);

  await lesson(u4.id, { slug: "donde-hay-mas", title: "¿Dónde hay más?", order: 4, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "⚖️", repeat: 1, text: "Primero vemos más e igual. Después vemos menos." }], { emoji: "🍎", count: 2, text: "Mirá los dos grupos.", successText: "¡Comparaste!" }),
    compareGroups({ item: "🍎", count: 3 }, { item: "🍎", count: 5 }),
    compareGroups({ item: "⭐", count: 4 }, { item: "⭐", count: 4 }),
    compareGroups({ item: "🐟", count: 6 }, { item: "🐟", count: 2 }),
    compareGroups({ item: "🍓", count: 5 }, { item: "🍓", count: 7 }),
  ]);

  await lesson(u4.id, { slug: "maquina-de-partes", title: "La máquina de partes", order: 5, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "⚙️", repeat: 1, text: "Un grupo puede separarse en partes." }], { emoji: "⭐", count: 4, text: "Tocá el grupo completo.", successText: "¡Ahora separalo!" }),
    partWhole(4, "⭐", [2, 2]),
    partWhole(5, "🍎", [1, 4]),
    partWhole(5, "🐟", [2, 3]),
    partWhole(6, "🍓", [2, 4]),
  ]);

  const u5 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "primeras-sumas",
      title: "Primeras sumas",
      description: "Juntar grupos para descubrir cuántos hay en total.",
      order: 5, color: "sun", icon: "➕",
    },
  });

  await lesson(u5.id, { slug: "juntar-grupos", title: "Juntar grupos", order: 1, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Para sumar, juntamos grupos y contamos todo." }], { emoji: "🍓", count: 5, text: "Tocá todas las frutillas juntas.", successText: "¡Todo junto!" }),
    add(1, 1, "🍎"),
    add(2, 1, "⭐"),
    add(2, 2, "🐟"),
  ]);

  await lesson(u5.id, { slug: "sumar-hasta-5", title: "Sumar hasta 5", order: 2, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🍓", repeat: 5, text: "Juntá grupos pequeños y contá el total." }], { emoji: "🍓", count: 5, text: "Tocá cinco frutillas.", successText: "¡Cinco!" }),
    add(2, 3, "🍓"),
    add(1, 4, "🍎"),
    add(3, 2, "⭐"),
  ]);

  await lesson(u5.id, { slug: "sumar-hasta-10", title: "Sumar hasta 10", order: 3, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🐟", repeat: 7, text: "Con grupos más grandes hacemos lo mismo: juntamos y contamos." }], { emoji: "🐟", count: 7, text: "Tocá siete peces.", successText: "¡Siete!" }),
    add(3, 3, "⭐"),
    add(4, 3, "🐟"),
    add(5, 5, "🍎"),
  ]);

  await lesson(u5.id, { slug: "repaso-sumas", title: "Repaso de sumas", order: 4, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Repasamos: juntar dos grupos nos da un total." }], { emoji: "🍎", count: 4, text: "Tocá el grupo junto.", successText: "¡Listo!" }),
    add(2, 2, "🍎"),
    add(3, 2, "⭐"),
    add(5, 3, "🍓"),
    add(4, 4, "🐟"),
  ]);

  const u6 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "primeras-restas",
      title: "Primeras restas",
      description: "Sacar objetos de un grupo y contar los que quedan.",
      order: 6, color: "rose", icon: "➖",
    },
  });

  await lesson(u6.id, { slug: "sacar-cosas", title: "Sacá y contá", order: 1, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "✋", repeat: 1, text: "Restar empieza con sacar cosas de un grupo." }], { emoji: "🧁", count: 3, text: "Tocá los que quedaron.", successText: "¡Quedaron!" }),
    sub(3, 1, "🍎"),
    sub(4, 2, "⭐"),
    sub(5, 2, "🐟"),
  ]);

  await lesson(u6.id, { slug: "restar-hasta-10", title: "Restar hasta 10", order: 2, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🐟", repeat: 8, text: "Si se van algunos, contamos los que quedan." }], { emoji: "🐟", count: 5, text: "Tocá cinco peces que quedan.", successText: "¡Cinco quedaron!" }),
    sub(6, 2, "🍎"),
    sub(8, 3, "⭐"),
    sub(10, 4, "🐟"),
  ]);

  await lesson(u6.id, { slug: "repaso-restas", title: "Repaso de restas", order: 3, xpReward: 36, minutes: 8 }, [
    lumi([{ emoji: "➖", repeat: 1, text: "Repasamos sacar y contar lo que queda." }], { emoji: "🧁", count: 5, text: "Tocá los cupcakes.", successText: "¡A sacar!" }),
    sub(4, 1, "🍎"),
    sub(7, 3, "⭐"),
    sub(9, 4, "🐟"),
    sub(10, 5, "🧁"),
  ]);

  // ============================================================
  // READING · Inicial (sin cambios — valida el motor multi-materia)
  // ============================================================
  const readingInitial = await prisma.learningPath.create({
    data: {
      subjectId: readingSubject.id,
      slug: "reading-initial",
      name: "Lectura inicial",
      description: "Letras, sonidos y primeras palabras.",
      level: EducationLevel.INITIAL,
      difficulty: 1,
      isPremium: false,
      order: 1,
    },
  });

  const ru1 = await prisma.unit.create({
    data: {
      learningPathId: readingInitial.id, slug: "letras-sonidos",
      title: "Letras y sonidos",
      description: "Reconocé las letras y los sonidos de cada una",
      order: 1, color: "mint", icon: "🔤",
    },
  });
  const rl1 = await prisma.lesson.create({
    data: { unitId: ru1.id, slug: "reconocer-vocales", title: "Vocales", order: 1, xpReward: 20, estimatedMinutes: 5 },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: rl1.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 1,
        prompt: "¿Qué letra es?",
        payload: { visual: "letter", letter: "A", options: ["A", "E", "I", "O"] },
        solution: { answer: "A" },
        hints: ["Es la primera del abecedario.", "Suena 'aaa', como en 'mamá'."],
        explanation: "Es la letra A, la primera vocal.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl1.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 2,
        prompt: "¿Qué letra es?",
        payload: { visual: "letter", letter: "E", options: ["U", "I", "E", "O"] },
        solution: { answer: "E" },
        hints: ["Suena 'eee', como en 'elefante'."],
        explanation: "Es la letra E.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl1.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 3,
        prompt: "¿Con qué letra empieza ☀️?",
        payload: { visual: "emoji-word", emoji: "☀️", label: "sol", options: ["S", "L", "M", "R"] },
        solution: { answer: "S" },
        hints: ["Decí la palabra: SSSSol.", "El sonido es como una serpiente."],
        explanation: "SOL empieza con la letra S.",
        difficulty: 1, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  const rl2 = await prisma.lesson.create({
    data: { unitId: ru1.id, slug: "contar-letras", title: "Contar letras", order: 2, xpReward: 25, estimatedMinutes: 6 },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: rl2.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 1,
        prompt: "¿Cuántas letras tiene la palabra?",
        payload: { visual: "word-letters", word: "SOL" },
        solution: { answer: 3 },
        hints: ["Contá las cajitas.", "S - O - L."],
        explanation: "SOL tiene 3 letras: S, O, L.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl2.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 2,
        prompt: "¿Cuántas letras tiene la palabra?",
        payload: { visual: "word-letters", word: "CASA" },
        solution: { answer: 4 },
        hints: ["Contá una por una.", "C - A - S - A."],
        explanation: "CASA tiene 4 letras.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl2.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 3,
        prompt: "¿Cuántas letras tiene la palabra?",
        payload: { visual: "word-letters", word: "LUNA" },
        solution: { answer: 4 },
        hints: ["L - U - N - A."],
        explanation: "LUNA tiene 4 letras.",
        difficulty: 2, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  const ru2 = await prisma.unit.create({
    data: {
      learningPathId: readingInitial.id, slug: "primeras-palabras",
      title: "Primeras palabras",
      description: "Identificá palabras simples y sus imágenes",
      order: 2, color: "lilac", icon: "📚",
    },
  });
  const rl3 = await prisma.lesson.create({
    data: { unitId: ru2.id, slug: "imagen-palabra", title: "¿Qué dice la imagen?", order: 1, xpReward: 25, estimatedMinutes: 6 },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: rl3.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 1,
        prompt: "¿Qué palabra describe la imagen?",
        payload: { visual: "emoji-word", emoji: "🐶", options: ["perro", "gato", "vaca", "pato"] },
        solution: { answer: "perro" },
        hints: ["Es un animal que ladra: ¡guau guau!"],
        explanation: "🐶 es un perro.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl3.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 2,
        prompt: "¿Qué palabra describe la imagen?",
        payload: { visual: "emoji-word", emoji: "🍎", options: ["pera", "manzana", "uva", "banana"] },
        solution: { answer: "manzana" },
        hints: ["Es una fruta roja y crujiente."],
        explanation: "🍎 es una manzana.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl3.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 3,
        prompt: "¿Qué palabra dice?",
        payload: { visual: "word", word: "MAMA", options: ["papá", "mamá", "tío", "abuela"] },
        solution: { answer: "mamá" },
        hints: ["Empieza y termina con la misma letra: M y A."],
        explanation: "M-A-M-A dice 'mamá'.",
        difficulty: 2, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  // ============================================================
  // SHOP + ACHIEVEMENTS (sin cambios)
  // ============================================================
  await prisma.shopItem.createMany({
    data: [
      { slug: "hat", kind: "ACCESSORY", name: "Sombrero", icon: "🎩", price: 50, rarity: "COMMON" },
      { slug: "crown", kind: "ACCESSORY", name: "Corona", icon: "👑", price: 200, rarity: "EPIC" },
      { slug: "glasses", kind: "ACCESSORY", name: "Anteojos", icon: "🕶️", price: 80, rarity: "RARE" },
      { slug: "bow", kind: "ACCESSORY", name: "Moño", icon: "🎀", price: 40, rarity: "COMMON" },
      { slug: "horn", kind: "ACCESSORY", name: "Cuerno", icon: "🦄", price: 300, rarity: "LEGENDARY" },
      { slug: "backpack", kind: "ACCESSORY", name: "Mochila", icon: "🎒", price: 120, rarity: "RARE" },
      { slug: "gems-100", kind: "GEMS_PACK", name: "100 gemas", icon: "💎", price: 99 },
      { slug: "gems-500", kind: "GEMS_PACK", name: "500 gemas", icon: "💎", price: 399 },
      { slug: "gems-1500", kind: "GEMS_PACK", name: "1500 gemas", icon: "💎", price: 999 },
      { slug: "hearts-5", kind: "HEARTS_REFILL", name: "Recargar 5", icon: "❤️", price: 30 },
    ],
  });

  await prisma.achievement.createMany({
    data: [
      { slug: "first-lesson", name: "Primera lección", description: "Completá 1 lección", icon: "🌟", target: 1, metric: "lessons_completed" },
      { slug: "streak-3", name: "3 días seguidos", description: "Mantené racha", icon: "🔥", target: 3, metric: "streak" },
      { slug: "correct-100", name: "100 aciertos", description: "Sumá 100 correctas", icon: "💯", target: 100, metric: "correct_answers" },
      { slug: "lessons-5", name: "5 lecciones", description: "Completá 5 lecciones", icon: "📚", target: 5, metric: "lessons_completed" },
      { slug: "speed-10", name: "Velocista", description: "10 correctas en 1min", icon: "⚡", target: 10, metric: "speed_run" },
    ],
  });

  const counts = {
    subjects: await prisma.subject.count(),
    paths: await prisma.learningPath.count(),
    units: await prisma.unit.count(),
    lessons: await prisma.lesson.count(),
    exercises: await prisma.exercise.count(),
    shopItems: await prisma.shopItem.count(),
    achievements: await prisma.achievement.count(),
  };
  console.log("✅ Seed listo:", counts);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
