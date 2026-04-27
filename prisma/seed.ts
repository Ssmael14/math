// prisma/seed.ts
// Corre con: npm run db:seed
// Crea 1 unidad ("Números 1-10") con 3 lecciones y 10 ejercicios reales.

import { PrismaClient, ExerciseKind } from "@prisma/client";
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
        solution: { answer: 3 } },
      { lessonId: l1.id, kind: ExerciseKind.COUNT, order: 2,
        prompt: "¿Cuántas manzanas hay?",
        payload: { item: "🍎", count: 5 },
        solution: { answer: 5 } },
      { lessonId: l1.id, kind: ExerciseKind.MATCH, order: 3,
        prompt: "Uní cada grupo con su número",
        payload: { groups: [{ item: "🐟", count: 3 }, { item: "🌸", count: 2 }], options: [2, 3, 4] },
        solution: { pairs: [[0, 1], [1, 0]] } },
      { lessonId: l1.id, kind: ExerciseKind.TRACE, order: 4,
        prompt: "Trazá el número 5",
        payload: { digit: 5 },
        solution: { digit: 5 } },
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
        solution: { answer: 7 } },
      { lessonId: l2.id, kind: ExerciseKind.ORDER, order: 2,
        prompt: "Ordená de menor a mayor",
        payload: { numbers: [8, 3, 6, 1] },
        solution: { order: [1, 3, 6, 8] } },
      { lessonId: l2.id, kind: ExerciseKind.TRACE, order: 3,
        prompt: "Trazá el número 8",
        payload: { digit: 8 },
        solution: { digit: 8 } },
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
        solution: { answer: 5 } },
      { lessonId: l3.id, kind: ExerciseKind.FILL, order: 2,
        prompt: "2 + ? = 5",
        payload: { a: 2, result: 5, options: [1, 2, 3, 4, 5, 6, 7, 8] },
        solution: { answer: 3 } },
      { lessonId: l3.id, kind: ExerciseKind.SUBTRACT, order: 3,
        prompt: "Tenías 5 cupcakes, te comiste 2. ¿Cuántos quedan?",
        payload: { total: 5, removed: 2, item: "🧁" },
        solution: { answer: 3 } },
    ],
  });

  // ============================================================
  // UNIDAD 2: Sumas hasta 10 (premium)
  // ============================================================
  await prisma.unit.create({
    data: {
      slug: "sumas-hasta-10",
      title: "Sumas hasta 10",
      description: "Sumar como un campeón",
      order: 2,
      color: "mint",
      icon: "➕",
      isPremium: true,
    },
  });

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

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
