// prisma/seed.ts
// Corre con: npm run db:seed
// Crea contenido curado + un set grande de ejercicios procedurales.

import { PrismaClient, ExerciseKind, Prisma } from "@prisma/client";
import { generateBatch, type GeneratedExercise } from "../lib/generators";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LearnMath...");

  // Limpiar contenido (ojo: no toca users ni children reales)
  await prisma.attempt.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.shopItem.deleteMany();
  await prisma.childAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.weeklyXP.deleteMany();

  // ============================================================
  // UNIDAD 1: Números del 1 al 10
  // ============================================================
  const u1 = await prisma.unit.create({
    data: {
      slug: "numeros-1-10",
      title: "Números 1 al 10",
      description: "Aprendé a contar y reconocer los primeros números",
      order: 1,
      color: "peach",
      icon: "🔢",
      isPremium: false,
    },
  });

  // Lección 1: Contar
  const l1 = await prisma.lesson.create({
    data: {
      unitId: u1.id,
      slug: "contar-hasta-5",
      title: "Contar hasta 5",
      order: 1,
      xpReward: 20,
    },
  });
  await prisma.exercise.createMany({
    data: [
      { lessonId: l1.id, kind: ExerciseKind.COUNT, order: 1,
        prompt: "¿Cuántas estrellas hay?",
        payload: { item: "⭐", count: 3 },
        solution: { answer: 3 },
        hints: ["Apuntá con el dedo a cada estrella mientras contás.", "Son menos de cinco."],
        explanation: "Hay 3 estrellas: una, dos, tres ⭐⭐⭐." },
      { lessonId: l1.id, kind: ExerciseKind.COUNT, order: 2,
        prompt: "¿Cuántas manzanas hay?",
        payload: { item: "🍎", count: 5 },
        solution: { answer: 5 },
        hints: ["Contá una por una sin saltarte ninguna.", "Llegan justo a la mano completa."],
        explanation: "Son 5 manzanas — como los dedos de una mano." },
      { lessonId: l1.id, kind: ExerciseKind.MATCH, order: 3,
        prompt: "Uní cada grupo con su número",
        payload: { groups: [{ item: "🐟", count: 3 }, { item: "🌸", count: 2 }], options: [2, 3, 4] },
        solution: { pairs: [[0, 1], [1, 0]] },
        hints: ["Empezá por el grupo más chico.", "Contá los peces primero."],
        explanation: "El grupo de peces tiene 3 y el de flores tiene 2." },
      { lessonId: l1.id, kind: ExerciseKind.TRACE, order: 4,
        prompt: "Trazá el número 5",
        payload: { digit: 5 },
        solution: { digit: 5 },
        hints: ["Es el número que viene después del 4."],
        explanation: "El 5 se escribe con una rayita arriba y una panza abajo." },
    ],
  });

  // Lección 2: Números hasta 10
  const l2 = await prisma.lesson.create({
    data: {
      unitId: u1.id,
      slug: "contar-hasta-10",
      title: "Contar hasta 10",
      order: 2,
      xpReward: 25,
    },
  });
  await prisma.exercise.createMany({
    data: [
      { lessonId: l2.id, kind: ExerciseKind.COUNT, order: 1,
        prompt: "¿Cuántos peces hay?",
        payload: { item: "🐟", count: 7 },
        solution: { answer: 7 },
        hints: ["Contá despacito de izquierda a derecha.", "Son más de cinco."],
        explanation: "Son 7 peces — 5 más 2." },
      { lessonId: l2.id, kind: ExerciseKind.ORDER, order: 2,
        prompt: "Ordená de menor a mayor",
        payload: { numbers: [8, 3, 6, 1] },
        solution: { order: [1, 3, 6, 8] },
        hints: ["Empezá por el más chico.", "El 1 va primero, después seguís."],
        explanation: "De menor a mayor: 1, 3, 6, 8." },
      { lessonId: l2.id, kind: ExerciseKind.TRACE, order: 3,
        prompt: "Trazá el número 8",
        payload: { digit: 8 },
        solution: { digit: 8 },
        hints: ["Son dos círculos uno arriba del otro."],
        explanation: "El 8 se hace con dos círculos pegados." },
    ],
  });

  // Lección 3: Sumas simples
  const l3 = await prisma.lesson.create({
    data: {
      unitId: u1.id,
      slug: "sumas-simples",
      title: "Primeras sumas",
      order: 3,
      xpReward: 30,
    },
  });
  await prisma.exercise.createMany({
    data: [
      { lessonId: l3.id, kind: ExerciseKind.DRAG, order: 1,
        prompt: "Sumá los peces: 2 + 3",
        payload: { a: 2, b: 3, item: "🐟" },
        solution: { answer: 5 },
        hints: ["Junta los dos grupos y contá todo.", "2 peces más 3 peces."],
        explanation: "2 + 3 = 5. Si juntás los dos grupos te quedan 5 peces." },
      { lessonId: l3.id, kind: ExerciseKind.FILL, order: 2,
        prompt: "2 + ? = 5",
        payload: { a: 2, result: 5, options: [1, 2, 3, 4, 5, 6, 7, 8] },
        solution: { answer: 3 },
        hints: ["¿Cuánto le falta al 2 para llegar al 5?", "Contá con los dedos desde el 2 hasta el 5."],
        explanation: "Falta 3, porque 2 + 3 = 5." },
      { lessonId: l3.id, kind: ExerciseKind.SUBTRACT, order: 3,
        prompt: "Tenías 5 cupcakes, te comiste 2. ¿Cuántos quedan?",
        payload: { total: 5, removed: 2, item: "🧁" },
        solution: { answer: 3 },
        hints: ["Empezá desde 5 y retrocedé 2.", "Tachá los que ya no están."],
        explanation: "5 menos 2 son 3 cupcakes." },
    ],
  });

  // ============================================================
  // UNIDAD 2: Práctica generada (no premium — muestra el motor procedural)
  // ============================================================
  const u2 = await prisma.unit.create({
    data: {
      slug: "practica-1-5",
      title: "Práctica · números 1 al 5",
      description: "Lecciones autogeneradas para reforzar lo básico",
      order: 2,
      color: "mint",
      icon: "♻️",
      isPremium: false,
    },
  });
  await seedProceduralUnit({ unitId: u2.id, max: 5, lessonsCount: 4, perLesson: 12, baseSeed: 1000 });

  // ============================================================
  // UNIDAD 3: Práctica hasta 10 (premium para mostrar paywall)
  // ============================================================
  const u3 = await prisma.unit.create({
    data: {
      slug: "practica-1-10",
      title: "Práctica · sumas y restas hasta 10",
      description: "Más fluidez con números más grandes",
      order: 3,
      color: "lilac",
      icon: "🎲",
      isPremium: true,
    },
  });
  await seedProceduralUnit({ unitId: u3.id, max: 10, lessonsCount: 6, perLesson: 15, baseSeed: 2000 });

  // ============================================================
  // SHOP · accesorios para Lumi + packs de gemas
  // ============================================================
  await prisma.shopItem.createMany({
    data: [
      { slug: "hat",        kind: "ACCESSORY",     name: "Sombrero",  icon: "🎩", price: 50,  rarity: "COMMON" },
      { slug: "crown",      kind: "ACCESSORY",     name: "Corona",    icon: "👑", price: 200, rarity: "EPIC" },
      { slug: "glasses",    kind: "ACCESSORY",     name: "Anteojos",  icon: "🕶️", price: 80,  rarity: "RARE" },
      { slug: "bow",        kind: "ACCESSORY",     name: "Moño",      icon: "🎀", price: 40,  rarity: "COMMON" },
      { slug: "horn",       kind: "ACCESSORY",     name: "Cuerno",    icon: "🦄", price: 300, rarity: "LEGENDARY" },
      { slug: "backpack",   kind: "ACCESSORY",     name: "Mochila",   icon: "🎒", price: 120, rarity: "RARE" },
      { slug: "gems-100",   kind: "GEMS_PACK",     name: "100 gemas", icon: "💎", price: 99 },
      { slug: "gems-500",   kind: "GEMS_PACK",     name: "500 gemas", icon: "💎", price: 399 },
      { slug: "gems-1500",  kind: "GEMS_PACK",     name: "1500 gemas",icon: "💎", price: 999 },
      { slug: "hearts-5",   kind: "HEARTS_REFILL", name: "Recargar 5",icon: "❤️", price: 30 },
    ],
  });

  // ============================================================
  // ACHIEVEMENTS · medallas a desbloquear
  // ============================================================
  await prisma.achievement.createMany({
    data: [
      { slug: "first-lesson",  name: "Primera lección", description: "Completá 1 lección",  icon: "🌟", target: 1,   metric: "lessons_completed" },
      { slug: "streak-3",      name: "3 días seguidos", description: "Mantené racha",       icon: "🔥", target: 3,   metric: "streak" },
      { slug: "correct-100",   name: "100 aciertos",    description: "Sumá 100 correctas",  icon: "💯", target: 100, metric: "correct_answers" },
      { slug: "lessons-5",     name: "5 lecciones",     description: "Completá 5 lecciones",icon: "📚", target: 5,   metric: "lessons_completed" },
      { slug: "unit-master",   name: "Maestro sumas",   description: "Terminá unidad",      icon: "🏆", target: 10,  metric: "lessons_completed" },
      { slug: "speed-10",      name: "Velocista",       description: "10 correctas en 1min",icon: "⚡", target: 10,  metric: "speed_run" },
    ],
  });

  const counts = {
    units:        await prisma.unit.count(),
    lessons:      await prisma.lesson.count(),
    exercises:    await prisma.exercise.count(),
    shopItems:    await prisma.shopItem.count(),
    achievements: await prisma.achievement.count(),
  };
  console.log("✅ Seed listo:", counts);
}

// =========================================================================
// Helper: crea N lecciones con M ejercicios procedurales c/u dentro de
// una unidad. Usa `baseSeed` + offset por lección para que sea reproducible
// pero cada lección tenga ejercicios distintos.
// =========================================================================
async function seedProceduralUnit({
  unitId, max, lessonsCount, perLesson, baseSeed,
}: {
  unitId: string;
  max: number;
  lessonsCount: number;
  perLesson: number;
  baseSeed: number;
}) {
  for (let li = 0; li < lessonsCount; li++) {
    const lesson = await prisma.lesson.create({
      data: {
        unitId,
        slug: `practica-${max}-l${li + 1}`,
        title: `Práctica ${li + 1}`,
        order: li + 1,
        xpReward: 20 + li * 5,
      },
    });

    const batch: GeneratedExercise[] = generateBatch({
      seed: baseSeed + li * 31,
      count: perLesson,
      max,
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
    }));
    await prisma.exercise.createMany({ data });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
