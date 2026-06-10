import { EducationLevel, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  {
    slug: "math",
    name: "Matemáticas",
    description:
      "Clasificar, descubrir patrones, contar, comparar, juntar y sacar — con juegos visuales.",
    icon: "🧮",
    color: "sun",
    order: 1,
    isActive: true,
  },
  {
    slug: "reading",
    name: "Lectura",
    description: "Letras, palabras y comprensión.",
    icon: "📖",
    color: "mint",
    order: 2,
    isActive: true,
  },
  {
    slug: "science",
    name: "Ciencias",
    description: "Naturaleza, espacio y experimentos.",
    icon: "🔬",
    color: "sky",
    order: 3,
    isActive: false,
  },
  {
    slug: "english",
    name: "Inglés",
    description: "Vocabulario, pronunciación y frases.",
    icon: "🗣️",
    color: "lilac",
    order: 4,
    isActive: false,
  },
];

const paths = [
  {
    subjectSlug: "math",
    slug: "math-initial-nel",
    name: "Inicial · Aventura con Paskalito",
    description:
      "Clasificar, descubrir patrones, contar, comparar, juntar y sacar — paso a paso con Paskalito.",
    level: EducationLevel.INITIAL,
    difficulty: 1,
    isPremium: false,
    order: 1,
  },
  {
    subjectSlug: "math",
    slug: "math-number-tracing",
    name: "Trazos de números",
    description: "Practica escribir los números del 0 al 9 con el dedo.",
    level: EducationLevel.INITIAL,
    difficulty: 1,
    isPremium: false,
    order: 2,
  },
  {
    subjectSlug: "math",
    slug: "math-primary-1",
    name: "1.º grado · Matemática con Paskalito",
    description:
      "Números hasta 100, valor posicional, sumar, restar, medir, leer datos y resolver problemas.",
    level: EducationLevel.PRIMARY,
    grade: 1,
    difficulty: 2,
    isPremium: false,
    order: 3,
  },
  {
    subjectSlug: "reading",
    slug: "reading-initial",
    name: "Lectura inicial",
    description: "Letras, sonidos y primeras palabras.",
    level: EducationLevel.INITIAL,
    difficulty: 1,
    isPremium: true,
    order: 1,
  },
];

const units = [
  {
    pathSlug: "math-initial-nel",
    slug: "antes-de-contar",
    title: "Antes de contar",
    description:
      "Emparejar, clasificar, comparar, ordenar y descubrir patrones.",
    order: 1,
    color: "peach",
    icon: "🧩",
  },
  {
    pathSlug: "math-initial-nel",
    slug: "contar-tocando-1-5",
    title: "Contar tocando 1-5",
    description:
      "Contar uno por uno, en orden, y descubrir que el último número dice cuántos hay.",
    order: 2,
    color: "mint",
    icon: "🔢",
  },
  {
    pathSlug: "math-initial-nel",
    slug: "contar-hasta-10",
    title: "Contar hasta 10",
    description: "Seguir contando, reconocer grupos y ordenar hasta 10.",
    order: 3,
    color: "sky",
    icon: "🔟",
  },
  {
    pathSlug: "math-initial-nel",
    slug: "sentido-numerico",
    title: "Sentido numérico",
    description:
      "Ver cantidades, comparar grupos y descubrir partes dentro de un todo.",
    order: 4,
    color: "lilac",
    icon: "🧠",
  },
  {
    pathSlug: "math-initial-nel",
    slug: "primeras-sumas",
    title: "Primeras sumas",
    description: "Juntar grupos para descubrir cuántos hay en total.",
    order: 5,
    color: "sun",
    icon: "➕",
  },
  {
    pathSlug: "math-initial-nel",
    slug: "primeras-restas",
    title: "Primeras restas",
    description: "Sacar objetos de un grupo y contar los que quedan.",
    order: 6,
    color: "rose",
    icon: "➖",
  },
  {
    pathSlug: "math-number-tracing",
    slug: "conocer-el-cero",
    title: "Conocer el 0",
    description:
      "Descubrir que cero significa que no hay nada y practicar su trazo redondo.",
    order: 1,
    color: "mint",
    icon: "0️⃣",
  },
  {
    pathSlug: "math-number-tracing",
    slug: "trazos-1-3",
    title: "Trazar 1, 2 y 3",
    description: "Números pequeños con líneas y curvas simples.",
    order: 2,
    color: "sky",
    icon: "✏️",
  },
  {
    pathSlug: "math-number-tracing",
    slug: "trazos-4-5",
    title: "Trazar 4 y 5",
    description: "Practicar cambios de dirección y curvas cortas.",
    order: 3,
    color: "sun",
    icon: "4️⃣",
  },
  {
    pathSlug: "math-number-tracing",
    slug: "trazos-6-7",
    title: "Trazar 6 y 7",
    description: "Unir curvas y líneas largas con control del dedo.",
    order: 4,
    color: "peach",
    icon: "6️⃣",
  },
  {
    pathSlug: "math-number-tracing",
    slug: "trazos-8-9",
    title: "Trazar 8 y 9",
    description: "Números con curvas más retadoras para practicar despacio.",
    order: 5,
    color: "lilac",
    icon: "8️⃣",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-numeros-hasta-20",
    title: "Números hasta 20",
    description: "Contar, leer, comparar, ordenar y ubicar números hasta 20.",
    order: 1,
    color: "sky",
    icon: "🔢",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-decenas-unidades",
    title: "Decenas y unidades",
    description: "Formar números hasta 100 con grupos de diez y unidades.",
    order: 2,
    color: "mint",
    icon: "🧱",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-sumas-restas",
    title: "Sumar y restar",
    description: "Juntar, sacar y ver la relación entre suma y resta.",
    order: 3,
    color: "sun",
    icon: "➕",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-grupos-iguales",
    title: "Grupos iguales",
    description: "Primeras ideas de multiplicar y dividir con objetos.",
    order: 4,
    color: "peach",
    icon: "🧺",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-medicion-tiempo-dinero",
    title: "Medir, tiempo y dinero",
    description: "Comparar longitudes, leer horas y contar monedas.",
    order: 5,
    color: "lilac",
    icon: "📏",
  },
  {
    pathSlug: "math-primary-1",
    slug: "p1-formas-y-datos",
    title: "Formas y datos",
    description: "Reconocer figuras, construir dibujos y leer pictogramas.",
    order: 6,
    color: "rose",
    icon: "🔷",
  },
  {
    pathSlug: "reading-initial",
    slug: "letras-sonidos",
    title: "Letras y sonidos",
    description: "Reconocé las letras y los sonidos de cada una",
    order: 1,
    color: "mint",
    icon: "🔤",
  },
  {
    pathSlug: "reading-initial",
    slug: "primeras-palabras",
    title: "Primeras palabras",
    description: "Identifica palabras simples y sus imágenes",
    order: 2,
    color: "lilac",
    icon: "📚",
  },
];

const lessons = [
  ["antes-de-contar", "emparejar-iguales", "Emparejar iguales", 1, 22, 5],
  ["antes-de-contar", "clasificar-por-color", "Canastas de colores", 2, 24, 6],
  [
    "antes-de-contar",
    "clasificar-por-tamano-forma",
    "Pequeños, grandes y formas",
    3,
    24,
    6,
  ],
  ["antes-de-contar", "ordenar-objetos", "El tren de los tamaños", 4, 26, 6],
  [
    "antes-de-contar",
    "detectives-de-patrones",
    "Detectives de patrones",
    5,
    28,
    7,
  ],
  ["contar-tocando-1-5", "uno-a-uno", "Un toque, un número", 1, 22, 5],
  [
    "contar-tocando-1-5",
    "orden-estable",
    "La canción de los números",
    2,
    22,
    5,
  ],
  ["contar-tocando-1-5", "cardinalidad", "El último dice cuántos", 3, 24, 6],
  [
    "contar-tocando-1-5",
    "contar-desde-cualquier-lado",
    "Contar desde cualquier lado",
    4,
    24,
    6,
  ],
  [
    "contar-tocando-1-5",
    "repaso-contar-1-5",
    "Repaso 1 al 5",
    5,
    28,
    7,
  ],
  ["contar-hasta-10", "contar-6-7-8", "Contar 6, 7, 8", 1, 26, 6],
  ["contar-hasta-10", "contar-9-10", "Contar 9 y 10", 2, 26, 6],
  ["contar-hasta-10", "ordenar-hasta-10", "Ordenar hasta 10", 3, 28, 7],
  ["contar-hasta-10", "tarjetas-de-puntos", "Tarjetas de puntos", 4, 30, 7],
  ["contar-hasta-10", "repaso-hasta-10", "Repaso hasta 10", 5, 32, 8],
  ["sentido-numerico", "cuantos-viste", "¿Cuántos viste?", 1, 30, 7],
  ["sentido-numerico", "dados-y-dominos", "Dados y dominós", 2, 30, 7],
  [
    "sentido-numerico",
    "mago-de-las-cantidades",
    "El mago de las cantidades",
    3,
    30,
    7,
  ],
  ["sentido-numerico", "donde-hay-mas", "¿Dónde hay más?", 4, 30, 7],
  ["sentido-numerico", "maquina-de-partes", "La máquina de partes", 5, 32, 8],
  ["primeras-sumas", "juntar-grupos", "Juntar grupos", 1, 28, 7],
  ["primeras-sumas", "sumar-hasta-5", "Sumar hasta 5", 2, 30, 7],
  ["primeras-sumas", "sumar-hasta-10", "Sumar hasta 10", 3, 32, 8],
  ["primeras-sumas", "repaso-sumas", "Repaso de sumas", 4, 34, 8],
  ["primeras-restas", "sacar-cosas", "Saca y cuenta", 1, 30, 7],
  ["primeras-restas", "restar-hasta-10", "Restar hasta 10", 2, 32, 8],
  ["primeras-restas", "repaso-restas", "Repaso de restas", 3, 36, 8],
  ["conocer-el-cero", "trazar-0", "Trazar 0", 1, 24, 6],
  ["trazos-1-3", "trazar-1", "Trazar 1", 1, 24, 6],
  ["trazos-1-3", "trazar-2", "Trazar 2", 2, 24, 6],
  ["trazos-1-3", "trazar-3", "Trazar 3", 3, 24, 6],
  ["trazos-4-5", "trazar-4", "Trazar 4", 1, 24, 6],
  ["trazos-4-5", "trazar-5", "Trazar 5", 2, 24, 6],
  ["trazos-6-7", "trazar-6", "Trazar 6", 1, 26, 6],
  ["trazos-6-7", "trazar-7", "Trazar 7", 2, 26, 6],
  ["trazos-8-9", "trazar-8", "Trazar 8", 1, 26, 6],
  ["trazos-8-9", "trazar-9", "Trazar 9", 2, 26, 6],
  ["p1-numeros-hasta-20", "contar-hasta-20", "Contar hasta 20", 1, 30, 7],
  ["p1-numeros-hasta-20", "leer-numeros-20", "Leer números hasta 20", 2, 30, 7],
  ["p1-numeros-hasta-20", "comparar-hasta-20", "Comparar hasta 20", 3, 32, 7],
  ["p1-numeros-hasta-20", "ordinales-primero-decimo", "Primero a décimo", 4, 32, 7],
  ["p1-decenas-unidades", "hacer-una-decena", "Hacer una decena", 1, 30, 7],
  ["p1-decenas-unidades", "valor-posicional", "Valor posicional", 2, 32, 8],
  ["p1-decenas-unidades", "ordenar-hasta-100", "Ordenar hasta 100", 3, 34, 8],
  ["p1-decenas-unidades", "patrones-numericos", "Patrones numéricos", 4, 34, 8],
  ["p1-sumas-restas", "sumar-hasta-20", "Sumar hasta 20", 1, 34, 8],
  ["p1-sumas-restas", "restar-hasta-20", "Restar hasta 20", 2, 34, 8],
  ["p1-sumas-restas", "sumar-restar-hasta-100", "Sumar y restar decenas", 3, 36, 8],
  ["p1-sumas-restas", "familias-de-hechos", "Familias de suma y resta", 4, 36, 8],
  ["p1-grupos-iguales", "contar-grupos-iguales", "Contar grupos iguales", 1, 34, 8],
  ["p1-grupos-iguales", "arreglos-y-filas", "Filas y columnas", 2, 34, 8],
  ["p1-grupos-iguales", "repartir-en-partes-iguales", "Repartir en partes iguales", 3, 36, 8],
  ["p1-medicion-tiempo-dinero", "contar-dinero", "Contar dinero", 1, 32, 7],
  ["p1-medicion-tiempo-dinero", "comparar-longitudes", "Comparar longitudes", 2, 32, 7],
  ["p1-medicion-tiempo-dinero", "leer-horas", "Leer horas", 3, 32, 7],
  ["p1-formas-y-datos", "formas-2d", "Figuras 2D", 1, 32, 7],
  ["p1-formas-y-datos", "crear-figuras", "Crear figuras", 2, 34, 8],
  ["p1-formas-y-datos", "leer-pictogramas", "Leer pictogramas", 3, 34, 8],
  ["p1-formas-y-datos", "repaso-primer-grado-1", "Repaso de 1.º grado", 4, 38, 9],
  ["letras-sonidos", "reconocer-vocales", "Vocales", 1, 20, 5],
  ["letras-sonidos", "contar-letras", "Contar letras", 2, 25, 6],
  ["primeras-palabras", "imagen-palabra", "¿Qué dice la imagen?", 1, 25, 6],
] as const;

const shopItems = [
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
] as const;

const achievements = [
  { slug: "first-lesson", name: "Primera lección", description: "Completa 1 lección", icon: "🌟", target: 1, metric: "lessons_completed" },
  { slug: "streak-3", name: "3 días seguidos", description: "Mantén racha", icon: "🔥", target: 3, metric: "streak" },
  { slug: "correct-100", name: "100 aciertos", description: "Suma 100 correctas", icon: "💯", target: 100, metric: "correct_answers" },
  { slug: "lessons-5", name: "5 lecciones", description: "Completa 5 lecciones", icon: "📚", target: 5, metric: "lessons_completed" },
  { slug: "speed-10", name: "Velocista", description: "10 correctas en 1min", icon: "⚡", target: 10, metric: "speed_run" },
] as const;

async function main() {
  console.log("🌱 Upserting content without touching user data...");

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: subject,
      create: subject,
    });
  }

  const subjectIds = Object.fromEntries(
    (await prisma.subject.findMany({ select: { id: true, slug: true } })).map(
      (subject) => [subject.slug, subject.id],
    ),
  );

  for (const path of paths) {
    const { subjectSlug, ...data } = path;
    const subjectId = subjectIds[subjectSlug];
    if (!subjectId) throw new Error(`Missing subject ${subjectSlug}`);
    await prisma.learningPath.upsert({
      where: { slug: data.slug },
      update: { ...data, subjectId },
      create: { ...data, subjectId },
    });
  }

  const pathIds = Object.fromEntries(
    (await prisma.learningPath.findMany({ select: { id: true, slug: true } })).map(
      (path) => [path.slug, path.id],
    ),
  );

  for (const unit of units) {
    const { pathSlug, ...data } = unit;
    const learningPathId = pathIds[pathSlug];
    if (!learningPathId) throw new Error(`Missing path ${pathSlug}`);
    await prisma.unit.upsert({
      where: { learningPathId_slug: { learningPathId, slug: data.slug } },
      update: { ...data, learningPathId },
      create: { ...data, learningPathId },
    });
  }

  const unitRows = await prisma.unit.findMany({
    select: { id: true, slug: true, learningPathId: true },
  });
  const unitBySlug = new Map(unitRows.map((unit) => [unit.slug, unit]));

  for (const [unitSlug, slug, title, order, xpReward, estimatedMinutes] of lessons) {
    const unit = unitBySlug.get(unitSlug);
    if (!unit) throw new Error(`Missing unit ${unitSlug}`);
    await prisma.lesson.upsert({
      where: { unitId_slug: { unitId: unit.id, slug } },
      update: { title, order, xpReward, estimatedMinutes },
      create: { unitId: unit.id, slug, title, order, xpReward, estimatedMinutes },
    });
  }

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }

  const counts = {
    subjects: await prisma.subject.count(),
    paths: await prisma.learningPath.count(),
    units: await prisma.unit.count(),
    lessons: await prisma.lesson.count(),
    shopItems: await prisma.shopItem.count(),
    achievements: await prisma.achievement.count(),
  };
  console.log("✅ Content seed listo:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
