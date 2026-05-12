// prisma/seed.ts
// Corre con: npm run db:seed
//
// Estado inicial del Learn Platform:
//  - 4 Subjects: Math (activo), Reading/Science/English (coming soon).
//  - 1 LearningPath funcional: "Primary 1" en Math.
//  - 3 Units con lecciones que cubren los visuales del motor.
//  - Shop + Achievements compartidos cross-subject.

import { PrismaClient, ExerciseKind, EducationLevel, Prisma } from "@prisma/client";
import { generateBatch, type GeneratedExercise, type BatchMix } from "../lib/learning/generators";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Learn Platform...");

  // Limpiar contenido (no toca users/children reales).
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
  // SUBJECTS · Math activo + 3 placeholders "Coming soon"
  // ============================================================
  const mathSubject = await prisma.subject.create({
    data: {
      slug: "math",
      name: "Matemáticas",
      description: "Contar, sumar, restar, comparar y más.",
      icon: "🧮",
      color: "sun",
      order: 1,
      isActive: true,
    },
  });
  const readingSubject = await prisma.subject.create({
    data: {
      slug: "reading",
      name: "Lectura",
      description: "Letras, palabras y comprensión.",
      icon: "📖",
      color: "mint",
      order: 2,
      isActive: true, // ¡ya con contenido real!
    },
  });
  await prisma.subject.createMany({
    data: [
      { slug: "science",  name: "Ciencias", description: "Naturaleza, espacio y experimentos.", icon: "🔬", color: "sky",   order: 3, isActive: false },
      { slug: "english",  name: "Inglés",   description: "Vocabulario, pronunciación y frases.", icon: "🗣️", color: "lilac", order: 4, isActive: false },
    ],
  });

  // ============================================================
  // MATH · Learning Path: Primary 1
  // ============================================================
  const primary1 = await prisma.learningPath.create({
    data: {
      subjectId: mathSubject.id,
      slug: "math-primary-1",
      name: "Primero · Aventura con Lumi",
      description: "Conocemos los números del 1 al 10, sumas y restas básicas.",
      level: EducationLevel.PRIMARY,
      grade: 1,
      difficulty: 1,
      isPremium: false,
      order: 1,
    },
  });

  // Unidad 1 (curada) — Números 1 al 10
  const u1 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id,
      slug: "numeros-1-10",
      title: "Números 1 al 10",
      description: "Aprendé a contar y reconocer los primeros números",
      order: 1,
      color: "peach",
      icon: "🔢",
    },
  });

  const l1 = await prisma.lesson.create({
    data: {
      unitId: u1.id, slug: "contar-hasta-5", title: "Contar hasta 5",
      order: 1, xpReward: 20, estimatedMinutes: 5,
    },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: l1.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 1,
        prompt: "¿Cuántas estrellas hay?",
        payload: { visual: "count", item: "⭐", count: 3 },
        solution: { answer: 3 },
        hints: ["Apuntá con el dedo a cada estrella mientras contás.", "Son menos de cinco."],
        explanation: "Hay 3 estrellas: una, dos, tres ⭐⭐⭐.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: l1.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 2,
        prompt: "¿Cuántas manzanas hay?",
        payload: { visual: "count", item: "🍎", count: 5 },
        solution: { answer: 5 },
        hints: ["Contá una por una sin saltarte ninguna.", "Llegan justo a la mano completa."],
        explanation: "Son 5 manzanas — como los dedos de una mano.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: l1.id, kind: ExerciseKind.DRAW, order: 3,
        prompt: "Trazá el número 5",
        payload: { digit: 5 },
        solution: { answer: 5 },
        hints: ["Es el número que viene después del 4."],
        explanation: "El 5 se escribe con una rayita arriba y una panza abajo.",
        difficulty: 1, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  const l2 = await prisma.lesson.create({
    data: {
      unitId: u1.id, slug: "contar-hasta-10", title: "Contar hasta 10",
      order: 2, xpReward: 25, estimatedMinutes: 6,
    },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: l2.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 1,
        prompt: "¿Cuántos peces hay?",
        payload: { visual: "count", item: "🐟", count: 7 },
        solution: { answer: 7 },
        hints: ["Contá despacito de izquierda a derecha.", "Son más de cinco."],
        explanation: "Son 7 peces — 5 más 2.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: l2.id, kind: ExerciseKind.DRAW, order: 2,
        prompt: "Trazá el número 8",
        payload: { digit: 8 },
        solution: { answer: 8 },
        hints: ["Son dos círculos uno arriba del otro."],
        explanation: "El 8 se hace con dos círculos pegados.",
        difficulty: 2, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  const l3 = await prisma.lesson.create({
    data: {
      unitId: u1.id, slug: "sumas-simples", title: "Primeras sumas",
      order: 3, xpReward: 30, estimatedMinutes: 8,
    },
  });
  await prisma.exercise.createMany({
    data: [
      {
        lessonId: l3.id, kind: ExerciseKind.DRAG_DROP, order: 1,
        prompt: "Arrastrá los peces al canasto y contá: 2 + 3",
        payload: { visual: "drag", a: 2, b: 3, item: "🐟" },
        solution: { answer: 5 },
        hints: ["Movelos a todos al canasto, después contá.", "2 peces más 3 peces."],
        explanation: "2 + 3 = 5. Si juntás los dos grupos te quedan 5 peces.",
        difficulty: 2, xpReward: 8,
      },
      {
        lessonId: l3.id, kind: ExerciseKind.INPUT, order: 2,
        prompt: "2 + ? = 5",
        payload: { visual: "fill", a: 2, result: 5 },
        solution: { answer: 3 },
        hints: ["¿Cuánto le falta al 2 para llegar al 5?", "Contá con los dedos desde el 2 hasta el 5."],
        explanation: "Falta 3, porque 2 + 3 = 5.",
        difficulty: 2, xpReward: 7,
      },
      {
        lessonId: l3.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 3,
        prompt: "Tenías 5 cupcakes y te comiste 2. ¿Cuántos quedan?",
        payload: { visual: "subtract", total: 5, removed: 2, item: "🧁" },
        solution: { answer: 3 },
        hints: ["Empezá desde 5 y retrocedé 2.", "Tachá los que ya no están."],
        explanation: "5 menos 2 son 3 cupcakes.",
        difficulty: 2, xpReward: 6,
      },
    ] as Prisma.ExerciseCreateManyInput[],
  });

  // ============================================================
  // UNIDADES procedurales para demostrar el motor
  // ============================================================
  // Práctica 1-5: sólo aritmética numérica básica.
  const u2 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "practica-1-5",
      title: "Práctica · 1 al 5",
      description: "Cuentas y operaciones simples",
      order: 2, color: "mint", icon: "♻️",
    },
  });
  const NUMERIC_MIX: Partial<BatchMix> = {
    count: 0.4, fill: 0.3, subtract: 0.3,
    compare: 0, parity: 0, pattern: 0, neighbor: 0, drag: 0,
  };
  await seedProceduralUnit({
    unitId: u2.id, max: 5, lessonsCount: 3, perLesson: 10,
    baseSeed: 1000, mix: NUMERIC_MIX, slugPrefix: "p1-5",
  });

  // Variedad: todos los visuales (compare, parity, pattern, neighbor, drag).
  const u3 = await prisma.unit.create({
    data: {
      learningPathId: primary1.id, slug: "variedad-1-10",
      title: "Variedad · comparar, ordenar y descubrir",
      description: "Mayor/menor, par/impar, series y vecinos",
      order: 3, color: "sky", icon: "🧠",
    },
  });
  await seedProceduralUnit({
    unitId: u3.id, max: 10, lessonsCount: 4, perLesson: 12,
    baseSeed: 3000, slugPrefix: "var-10",
  });

  // ============================================================
  // READING · Learning Path: Inicial
  // Validación del motor multi-materia: el mismo engine que corre Math
  // ahora soporta Reading sin nuevos kinds. Sólo cambian payload.visual y
  // payload.options. El runner es agnóstico al dominio.
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

  // --- Unidad 1: Letras y sonidos
  const ru1 = await prisma.unit.create({
    data: {
      learningPathId: readingInitial.id,
      slug: "letras-sonidos",
      title: "Letras y sonidos",
      description: "Reconocé las letras y los sonidos de cada una",
      order: 1,
      color: "mint",
      icon: "🔤",
    },
  });

  const rl1 = await prisma.lesson.create({
    data: {
      unitId: ru1.id, slug: "reconocer-vocales", title: "Vocales",
      order: 1, xpReward: 20, estimatedMinutes: 5,
    },
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
    data: {
      unitId: ru1.id, slug: "contar-letras", title: "Contar letras",
      order: 2, xpReward: 25, estimatedMinutes: 6,
    },
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

  // --- Unidad 2: Primeras palabras
  const ru2 = await prisma.unit.create({
    data: {
      learningPathId: readingInitial.id,
      slug: "primeras-palabras",
      title: "Primeras palabras",
      description: "Identificá palabras simples y sus imágenes",
      order: 2,
      color: "lilac",
      icon: "📚",
    },
  });

  const rl3 = await prisma.lesson.create({
    data: {
      unitId: ru2.id, slug: "imagen-palabra", title: "¿Qué dice la imagen?",
      order: 1, xpReward: 25, estimatedMinutes: 6,
    },
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
  // SHOP · cosmetics + utilidad
  // ============================================================
  await prisma.shopItem.createMany({
    data: [
      { slug: "hat",      kind: "ACCESSORY", name: "Sombrero", icon: "🎩", price: 50,  rarity: "COMMON" },
      { slug: "crown",    kind: "ACCESSORY", name: "Corona",   icon: "👑", price: 200, rarity: "EPIC" },
      { slug: "glasses",  kind: "ACCESSORY", name: "Anteojos", icon: "🕶️", price: 80,  rarity: "RARE" },
      { slug: "bow",      kind: "ACCESSORY", name: "Moño",     icon: "🎀", price: 40,  rarity: "COMMON" },
      { slug: "horn",     kind: "ACCESSORY", name: "Cuerno",   icon: "🦄", price: 300, rarity: "LEGENDARY" },
      { slug: "backpack", kind: "ACCESSORY", name: "Mochila",  icon: "🎒", price: 120, rarity: "RARE" },
      { slug: "gems-100", kind: "GEMS_PACK", name: "100 gemas", icon: "💎", price: 99 },
      { slug: "gems-500", kind: "GEMS_PACK", name: "500 gemas", icon: "💎", price: 399 },
      { slug: "gems-1500",kind: "GEMS_PACK", name: "1500 gemas",icon: "💎", price: 999 },
      { slug: "hearts-5", kind: "HEARTS_REFILL", name: "Recargar 5", icon: "❤️", price: 30 },
    ],
  });

  // ============================================================
  // ACHIEVEMENTS · cross-subject
  // ============================================================
  await prisma.achievement.createMany({
    data: [
      { slug: "first-lesson", name: "Primera lección", description: "Completá 1 lección",   icon: "🌟", target: 1,   metric: "lessons_completed" },
      { slug: "streak-3",     name: "3 días seguidos", description: "Mantené racha",        icon: "🔥", target: 3,   metric: "streak" },
      { slug: "correct-100",  name: "100 aciertos",    description: "Sumá 100 correctas",   icon: "💯", target: 100, metric: "correct_answers" },
      { slug: "lessons-5",    name: "5 lecciones",     description: "Completá 5 lecciones", icon: "📚", target: 5,   metric: "lessons_completed" },
      { slug: "speed-10",     name: "Velocista",       description: "10 correctas en 1min", icon: "⚡", target: 10,  metric: "speed_run" },
    ],
  });

  const counts = {
    subjects:     await prisma.subject.count(),
    paths:        await prisma.learningPath.count(),
    units:        await prisma.unit.count(),
    lessons:      await prisma.lesson.count(),
    exercises:    await prisma.exercise.count(),
    shopItems:    await prisma.shopItem.count(),
    achievements: await prisma.achievement.count(),
  };
  console.log("✅ Seed listo:", counts);
}

// =========================================================================
// Helper: crea N lecciones con M ejercicios procedurales c/u.
// =========================================================================
async function seedProceduralUnit({
  unitId, max, lessonsCount, perLesson, baseSeed, mix, slugPrefix = "practica",
}: {
  unitId: string;
  max: number;
  lessonsCount: number;
  perLesson: number;
  baseSeed: number;
  mix?: Partial<BatchMix>;
  slugPrefix?: string;
}) {
  for (let li = 0; li < lessonsCount; li++) {
    const lesson = await prisma.lesson.create({
      data: {
        unitId,
        slug: `${slugPrefix}-${max}-l${li + 1}`,
        title: `Práctica ${li + 1}`,
        order: li + 1,
        xpReward: 20 + li * 5,
      },
    });

    const batch: GeneratedExercise[] = generateBatch({
      seed: baseSeed + li * 31,
      count: perLesson,
      max,
      mix,
    });

    const data: Prisma.ExerciseCreateManyInput[] = batch.map((g, idx) => ({
      lessonId: lesson.id,
      kind: g.kind,
      order: idx + 1,
      prompt: g.prompt,
      payload: g.payload as Prisma.InputJsonValue,
      solution: g.solution as unknown as Prisma.InputJsonValue,
      hints: g.hints as unknown as Prisma.InputJsonValue,
      explanation: g.explanation,
      difficulty: g.difficulty,
    }));
    await prisma.exercise.createMany({ data });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
