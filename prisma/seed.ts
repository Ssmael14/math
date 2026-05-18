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
    prompt: `Llevá todo al canasto y contá: ${a} + ${b}`,
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
      description: "Contar, comparar, sumar y restar — paso a paso con Lumi.",
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
  // MATH · Primero · Aventura con Lumi
  // ============================================================
  const primary1 = await prisma.learningPath.create({
    data: {
      subjectId: mathSubject.id,
      slug: "math-primary-1",
      name: "Primero · Aventura con Lumi",
      description: "Contar del 1 al 10, comparar, ordenar, y las primeras sumas y restas.",
      level: EducationLevel.PRIMARY,
      grade: 1,
      difficulty: 1,
      isPremium: false,
      order: 1,
    },
  });

  // ---------- Unidad 1 · Números 1 al 5 ----------
  const u1 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "numeros-1-5",
      title: "Números 1 al 5",
      description: "Contar tocando, comparar y ordenar hasta 5",
      order: 1, color: "peach", icon: "🔢",
    },
  });

  await lesson(u1.id, { slug: "contar-1-2-3", title: "Contar 1, 2, 3", order: 1, xpReward: 20, minutes: 5 }, [
    lumi(
      [
        { emoji: "🍎", repeat: 1, text: "Esto es una manzana. ¡Una sola!" },
        { emoji: "🍎", repeat: 2, text: "Si hay otra, son dos: uno, dos." },
        { emoji: "🍎", repeat: 3, text: "Una más y son tres. Contar es tocar y decir el número." },
      ],
      { emoji: "🍎", count: 3, text: "Tocá las 3 manzanas, una por una.", successText: "¡Muy bien! Contaste hasta 3." },
    ),
    count("🐟", 2, "Son menos que tu mano."),
    count("⭐", 3, "Una, dos, y una más."),
    match([{ item: "🍎", count: 1 }, { item: "⭐", count: 2 }, { item: "🐟", count: 3 }], [2, 3, 1]),
  ]);

  await lesson(u1.id, { slug: "contar-4-5", title: "Contar 4 y 5", order: 2, xpReward: 22, minutes: 5 }, [
    lumi(
      [
        { emoji: "🐟", repeat: 4, text: "Mirá: cuatro pececitos. Uno, dos, tres, cuatro." },
        { emoji: "🖐️", repeat: 1, text: "Una más y son cinco — ¡como los dedos de una mano!" },
      ],
      { emoji: "🐟", count: 5, text: "Tocá los 5 peces, uno por uno.", successText: "¡Genial! Llegaste a 5." },
    ),
    count("⭐", 4, "Es uno más que tres."),
    count("🍎", 5, "Como los dedos de una mano."),
    trace(5),
  ]);

  await lesson(u1.id, { slug: "cual-tiene-mas", title: "¿Cuál tiene más?", order: 3, xpReward: 24, minutes: 6 }, [
    lumi(
      [
        { emoji: "🐊", repeat: 1, text: "Este es el cocodrilo comelón." },
        { emoji: "🐊", repeat: 1, text: "Su boca siempre se abre hacia donde hay MÁS." },
        { emoji: "🟰", repeat: 1, text: "Si hay lo mismo de los dos lados, son iguales." },
      ],
      { emoji: "🐊", count: 1, text: "Tocá al cocodrilo para saludarlo.", successText: "¡Listo! Ya sabés su truco." },
    ),
    compare(2, 5),
    compare(5, 3),
    compare(4, 4),
  ]);

  await lesson(u1.id, { slug: "ordenar-1-5", title: "Ordenar 1 a 5", order: 4, xpReward: 26, minutes: 6 }, [
    lumi(
      [
        { emoji: "🪜", repeat: 1, text: "Los números son una escalera." },
        { emoji: "1️⃣", repeat: 1, text: "Empezamos por el más chiquito y vamos subiendo." },
        { emoji: "5️⃣", repeat: 1, text: "Cada escalón es uno más que el anterior." },
      ],
      { emoji: "🪜", count: 1, text: "Tocá la escalera para empezar.", successText: "¡A ordenar!" },
    ),
    order([2, 1, 3]),
    match([{ item: "⭐", count: 4 }, { item: "🍎", count: 5 }], [5, 4]),
    order([3, 5, 1, 4, 2]),
  ]);

  await lesson(u1.id, { slug: "repaso-1-5", title: "Repaso 1 al 5", order: 5, xpReward: 32, minutes: 7 }, [
    count("🍎", 5, "Tocá uno por uno."),
    compare(2, 4),
    match([{ item: "🐟", count: 3 }, { item: "⭐", count: 5 }, { item: "🍎", count: 4 }], [4, 3, 5]),
    order([3, 1, 5, 2, 4]),
  ]);

  // ---------- Unidad 2 · Números 6 al 10 ----------
  const u2 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "numeros-6-10",
      title: "Números 6 al 10",
      description: "Seguir contando, comparar y ordenar hasta 10",
      order: 2, color: "mint", icon: "🔟",
    },
  });

  await lesson(u2.id, { slug: "contar-6-7-8", title: "Contar 6, 7, 8", order: 1, xpReward: 24, minutes: 6 }, [
    lumi(
      [
        { emoji: "🐟", repeat: 5, text: "Ya sabemos contar hasta cinco." },
        { emoji: "🐟", repeat: 6, text: "Una más es seis." },
        { emoji: "🐟", repeat: 8, text: "Y seguimos: siete, ocho." },
      ],
      { emoji: "🐟", count: 6, text: "Tocá los 6 peces.", successText: "¡Seis! Vas muy bien." },
    ),
    count("🍎", 6, "Uno más que cinco."),
    count("⭐", 7, "Seguí después de seis."),
    count("🐟", 8, "Contá despacio hasta el final."),
  ]);

  await lesson(u2.id, { slug: "contar-9-10", title: "Contar 9 y 10", order: 2, xpReward: 26, minutes: 6 }, [
    lumi(
      [
        { emoji: "⭐", repeat: 9, text: "Nueve estrellas. ¡Casi diez!" },
        { emoji: "🔟", repeat: 1, text: "Una más y llegamos a diez. ¡El número más grande de la unidad!" },
      ],
      { emoji: "⭐", count: 9, text: "Tocá las 9 estrellas.", successText: "¡Nueve! Sos un campeón." },
    ),
    count("🐟", 9, "Uno menos que diez."),
    count("🍎", 10, "Las dos manos llenas."),
    match([{ item: "⭐", count: 7 }, { item: "🐟", count: 9 }, { item: "🍎", count: 10 }], [10, 7, 9]),
  ]);

  await lesson(u2.id, { slug: "trazos-6-9", title: "Trazos 6 a 9", order: 3, xpReward: 26, minutes: 7 }, [
    lumi(
      [
        { emoji: "✏️", repeat: 1, text: "Escribir un número es dibujarlo con cuidado." },
        { emoji: "🔢", repeat: 1, text: "Seguí la guía con el dedo, sin apurarte." },
      ],
      { emoji: "✏️", count: 1, text: "Tocá el lápiz para empezar.", successText: "¡A trazar!" },
    ),
    trace(6),
    trace(9),
    trace(8),
  ]);

  await lesson(u2.id, { slug: "comparar-ordenar-10", title: "Comparar hasta 10", order: 4, xpReward: 28, minutes: 7 }, [
    lumi(
      [
        { emoji: "🐊", repeat: 1, text: "Vuelve el cocodrilo: su boca apunta al más grande." },
        { emoji: "🪜", repeat: 1, text: "Y para ordenar, del más chico al más grande." },
      ],
      { emoji: "🐊", count: 1, text: "Tocá al cocodrilo.", successText: "¡Vamos!" },
    ),
    compare(8, 6),
    compare(7, 9),
    compare(10, 10),
    order([9, 6, 8, 7, 10]),
  ]);

  await lesson(u2.id, { slug: "repaso-6-10", title: "Repaso 6 al 10", order: 5, xpReward: 34, minutes: 8 }, [
    count("🐟", 7, "Contá despacio."),
    trace(8),
    compare(10, 8),
    order([6, 9, 7, 10, 8]),
  ]);

  // ---------- Unidad 3 · Primeras sumas ----------
  const u3 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "primeras-sumas",
      title: "Primeras sumas",
      description: "Juntar grupos para sumar, hasta 10",
      order: 3, color: "sky", icon: "➕",
    },
  });

  await lesson(u3.id, { slug: "juntar-grupos", title: "Juntar grupos", order: 1, xpReward: 26, minutes: 7 }, [
    lumi(
      [
        { emoji: "🍓", repeat: 2, text: "Tenés 2 frutillas." },
        { emoji: "🍓", repeat: 3, text: "Te dan 3 más." },
        { emoji: "🍓", repeat: 5, text: "Si las juntás todas, ¡hay 5! Eso es sumar." },
      ],
      { emoji: "🍓", count: 5, text: "Tocá todas: 2 y 3 juntas.", successText: "¡Exacto! 2 más 3 es 5." },
    ),
    add(1, 1, "🍎"),
    add(2, 1, "⭐"),
    add(2, 2, "🐟"),
  ]);

  await lesson(u3.id, { slug: "sumar-hasta-5", title: "Sumar hasta 5", order: 2, xpReward: 28, minutes: 7 }, [
    lumi(
      [
        { emoji: "🧺", repeat: 1, text: "Para sumar, llevamos todo al canasto." },
        { emoji: "🍓", repeat: 5, text: "Y después contamos cuánto hay en total." },
      ],
      { emoji: "🍓", count: 5, text: "Tocá las 5 frutillas.", successText: "¡Cinco! Listo para sumar." },
    ),
    add(2, 3, "🍓"),
    add(1, 4, "🍎"),
    add(3, 2, "⭐"),
  ]);

  await lesson(u3.id, { slug: "sumar-hasta-10", title: "Sumar hasta 10", order: 3, xpReward: 30, minutes: 8 }, [
    lumi(
      [
        { emoji: "🐟", repeat: 3, text: "Tres peces…" },
        { emoji: "🐟", repeat: 7, text: "…y cuatro más son siete. Sumamos números más grandes igual." },
      ],
      { emoji: "🐟", count: 7, text: "Tocá los 7 peces.", successText: "¡Siete! Ya sumás hasta 10." },
    ),
    add(3, 3, "⭐"),
    add(4, 3, "🐟"),
    add(5, 5, "🍎"),
  ]);

  await lesson(u3.id, { slug: "repaso-sumas", title: "Repaso de sumas", order: 4, xpReward: 34, minutes: 8 }, [
    add(2, 2, "🍎"),
    add(3, 2, "⭐"),
    add(5, 3, "🍓"),
    add(4, 4, "🐟"),
  ]);

  // ---------- Unidad 4 · Primeras restas ----------
  const u4 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "primeras-restas",
      title: "Primeras restas",
      description: "Sacar para restar, hasta 10",
      order: 4, color: "lilac", icon: "➖",
    },
  });

  await lesson(u4.id, { slug: "sacar-cosas", title: "Quitar y sacar", order: 1, xpReward: 28, minutes: 7 }, [
    lumi(
      [
        { emoji: "🧁", repeat: 5, text: "Tenés 5 cupcakes." },
        { emoji: "🧁", repeat: 3, text: "Te comés 2… y quedan 3." },
        { emoji: "✋", repeat: 1, text: "Sacar cosas de un grupo es restar." },
      ],
      { emoji: "🧁", count: 3, text: "Tocá los 3 que quedaron.", successText: "¡Bien! 5 menos 2 es 3." },
    ),
    sub(3, 1, "🍎"),
    sub(4, 2, "⭐"),
    sub(5, 2, "🐟"),
  ]);

  await lesson(u4.id, { slug: "restar-hasta-10", title: "Restar hasta 10", order: 2, xpReward: 32, minutes: 8 }, [
    lumi(
      [
        { emoji: "🐟", repeat: 8, text: "Ocho peces nadando." },
        { emoji: "🐟", repeat: 5, text: "Se van 3 y quedan 5. Restamos números más grandes igual." },
      ],
      { emoji: "🐟", count: 5, text: "Tocá los 5 que quedaron.", successText: "¡Cinco! Ya restás hasta 10." },
    ),
    sub(6, 2, "🍎"),
    sub(8, 3, "⭐"),
    sub(10, 4, "🐟"),
  ]);

  await lesson(u4.id, { slug: "repaso-restas", title: "Repaso de restas", order: 3, xpReward: 36, minutes: 8 }, [
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
