import {
  EducationLevel,
  ExerciseKind,
  Prisma,
  PrismaClient,
} from "@prisma/client";

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
    isPremium: true,
    order: 1,
  },
  {
    subjectSlug: "math",
    slug: "math-number-tracing",
    name: "Trazos de números",
    description: "Practica escribir los números del 0 al 9 con el dedo.",
    level: EducationLevel.INITIAL,
    difficulty: 1,
    isPremium: true,
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
    isPremium: true,
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
  {
    subjectSlug: "reading",
    slug: "reading-letter-tracing",
    name: "Trazos de letras",
    description: "Reconoce y traza vocales en imprenta mayúscula con el dedo.",
    level: EducationLevel.INITIAL,
    difficulty: 1,
    isPremium: true,
    order: 2,
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
  {
    pathSlug: "reading-letter-tracing",
    slug: "vocales-mayusculas",
    title: "Vocales mayúsculas",
    description: "Trazar A, E, I, O y U en imprenta mayúscula.",
    order: 1,
    color: "mint",
    icon: "✏️",
  },
];

const lessons = [
  [
    "antes-de-contar",
    "emparejar-iguales",
    "Prueba gratis con Paskalito",
    1,
    26,
    6,
  ],
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
  ["p1-numeros-hasta-20", "contar-hasta-20", "Prueba gratis: contar hasta 20", 1, 32, 7],
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
  ["letras-sonidos", "reconocer-vocales", "Prueba gratis: vocales", 1, 26, 6],
  ["letras-sonidos", "contar-letras", "Contar letras", 2, 25, 6],
  ["primeras-palabras", "imagen-palabra", "¿Qué dice la imagen?", 1, 25, 6],
  ["vocales-mayusculas", "trazar-a", "Trazar A", 1, 24, 6],
  ["vocales-mayusculas", "trazar-e", "Trazar E", 2, 24, 6],
  ["vocales-mayusculas", "trazar-i", "Trazar I", 3, 24, 6],
  ["vocales-mayusculas", "trazar-o", "Trazar O", 4, 24, 6],
  ["vocales-mayusculas", "trazar-u", "Trazar U", 5, 24, 6],
] as const;

type ExerciseSeed = Omit<Prisma.ExerciseCreateManyInput, "lessonId">;

const mathInitialPreviewExercises: ExerciseSeed[] = [
  {
    kind: ExerciseKind.TEACH,
    order: 0,
    prompt: "",
    payload: {
      teach: {
        beats: [
          {
            emoji: "🧩",
            repeat: 1,
            text: "Esta es una prueba gratis. Juega un poquito de la aventura con Paskalito.",
          },
        ],
        tryIt: {
          emoji: "⭐",
          count: 2,
          text: "Toca las estrellas para empezar.",
          successText: "¡Vamos a jugar!",
        },
      },
    } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  },
  {
    kind: ExerciseKind.MATCH,
    order: 1,
    prompt: "Une cada fruta con su pareja.",
    payload: {
      visual: "same-match",
      left: [
        { id: "apple", emoji: "🍎" },
        { id: "banana", emoji: "🍌" },
        { id: "grape", emoji: "🍇" },
      ],
      right: [
        { id: "banana", emoji: "🍌" },
        { id: "grape", emoji: "🍇" },
        { id: "apple", emoji: "🍎" },
      ],
    } as Prisma.InputJsonValue,
    solution: { pairs: [[0, 2], [1, 0], [2, 1]] },
    hints: ["Busca el mismo dibujo.", "Toca una tarjeta y después su pareja."],
    explanation: "Cada fruta encontró otra igual.",
    difficulty: 1,
    xpReward: 6,
  },
  {
    kind: ExerciseKind.DRAG_DROP,
    order: 2,
    prompt: "Pon frutas con frutas y animales con animales.",
    payload: {
      visual: "sort-attribute",
      attribute: "type",
      items: [
        { id: "apple", emoji: "🍎", category: "fruits" },
        { id: "cat", emoji: "🐱", category: "animals" },
        { id: "banana", emoji: "🍌", category: "fruits" },
        { id: "dog", emoji: "🐶", category: "animals" },
      ],
      categories: [
        { id: "fruits", label: "Frutas", emoji: "🍎" },
        { id: "animals", label: "Animales", emoji: "🐱" },
      ],
    } as Prisma.InputJsonValue,
    solution: {
      groups: {
        fruits: ["apple", "banana"],
        animals: ["cat", "dog"],
      },
    },
    hints: ["Mira una característica a la vez.", "Si se parece a la canasta, va ahí."],
    explanation: "Clasificar es juntar las cosas que comparten una característica.",
    difficulty: 1,
    xpReward: 6,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 3,
    prompt: "¿Qué sigue en el patrón?",
    payload: {
      visual: "pattern-next",
      sequence: ["🍎", "🍌", "🍎", "🍌"],
      options: ["🍎", "🍌", "🍇"],
    } as Prisma.InputJsonValue,
    solution: { answer: "🍎" },
    hints: ["Di el patrón en voz baja.", "Busca qué parte se repite."],
    explanation: "El patrón se repite. Sigue 🍎.",
    difficulty: 1,
    xpReward: 6,
  },
  {
    kind: ExerciseKind.SORT,
    order: 4,
    prompt: "Pon cada círculo en el casillero que encaja.",
    payload: {
      visual: "order-objects",
      attribute: "size",
      objects: [
        { id: "small", emoji: "●", label: "pequeño", size: 1 },
        { id: "big", emoji: "●", label: "grande", size: 3 },
        { id: "medium", emoji: "●", label: "mediano", size: 2 },
      ],
    } as Prisma.InputJsonValue,
    solution: { sequence: ["small", "medium", "big"] },
    hints: ["Empieza por el más pequeño o corto.", "Después busca el que sigue."],
    explanation: "Ordenar es poner las cosas en una secuencia.",
    difficulty: 1,
    xpReward: 7,
  },
];

const numberTracingPreviewExercises: ExerciseSeed[] = [
  {
    kind: ExerciseKind.TEACH,
    order: 0,
    prompt: "",
    payload: {
      teach: {
        beats: [
          {
            emoji: "0️⃣",
            repeat: 1,
            text: "Esta prueba muestra cómo Paskalito ayuda a mirar, contar y trazar números.",
          },
        ],
        tryIt: {
          emoji: "0️⃣",
          count: 1,
          text: "Toca el cero.",
          successText: "¡Listo para trazar!",
        },
      },
    } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 1,
    prompt: "Toca el número 0.",
    payload: { visual: "number-card", digit: 0 } as Prisma.InputJsonValue,
    solution: { answer: 0 },
    hints: ["Busca la tarjeta que tiene el 0.", "Mira su forma redonda."],
    explanation: "Ese es el número 0. Primero lo reconocemos, después lo trazamos.",
    difficulty: 1,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 2,
    prompt: "La caja está vacía. ¿Cuántas cosas hay?",
    payload: { visual: "empty-box", item: "⭐" } as Prisma.InputJsonValue,
    solution: { answer: 0 },
    hints: ["No hay ninguna estrella.", "Cuando no hay nada, usamos cero."],
    explanation: "Cero significa que no hay ninguna cosa.",
    difficulty: 1,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.DRAW,
    order: 3,
    prompt: "Traza el número 0 con el dedo",
    payload: { digit: 0 } as Prisma.InputJsonValue,
    solution: { answer: 0 },
    hints: ["Sigue la guía despacito, sin levantar el dedo si no hace falta."],
    explanation: "Así se escribe el 0. ¡Cada vez te sale mejor!",
    difficulty: 2,
    xpReward: 6,
  },
];

const primaryOnePreviewExercises: ExerciseSeed[] = [
  {
    kind: ExerciseKind.TEACH,
    order: 0,
    prompt: "",
    payload: {
      teach: {
        beats: [
          {
            emoji: "🔢",
            repeat: 1,
            text: "Esta prueba muestra cómo Paskalito ayuda a contar, comparar y ordenar en 1.º grado.",
          },
        ],
        tryIt: {
          emoji: "⭐",
          count: 5,
          text: "Toca cinco estrellas para empezar.",
          successText: "¡Listo para contar!",
        },
      },
    } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 1,
    prompt: "Toca cada uno y cuenta. ¿Cuántos hay?",
    payload: { visual: "count", item: "⭐", count: 12 } as Prisma.InputJsonValue,
    solution: { answer: 12 },
    hints: ["Cuenta primero diez y después dos más.", "Toca uno por uno, sin saltarte ninguno."],
    explanation: "Hay 12. El último número que dices indica cuántos hay.",
    difficulty: 2,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.DRAG_DROP,
    order: 2,
    prompt: "Pon el número que falta en la recta.",
    payload: {
      visual: "number-line-input",
      sequence: [10, 11, null, 13, 14],
      choices: [11, 12, 13, 14],
      step: 1,
    } as Prisma.InputJsonValue,
    solution: { answer: 12 },
    hints: ["La secuencia avanza de 1 en 1.", "Mira el número anterior y el siguiente."],
    explanation: "Falta 12. La secuencia mantiene el mismo salto.",
    difficulty: 1,
    xpReward: 8,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 3,
    prompt: "¿Dónde hay más?",
    payload: {
      visual: "compare-groups",
      left: { item: "🍎", count: 9 },
      right: { item: "🍎", count: 12 },
      options: ["izquierda", "derecha", "igual"],
    } as Prisma.InputJsonValue,
    solution: { answer: "derecha" },
    hints: ["Mira los dos grupos.", "Puedes tocar y contar para comprobar."],
    explanation: "Hay más en la derecha.",
    difficulty: 2,
    xpReward: 7,
  },
  {
    kind: ExerciseKind.SORT,
    order: 4,
    prompt: "Ordena de menor a mayor",
    payload: { numbers: [12, 11, 13] } as Prisma.InputJsonValue,
    solution: { sequence: [11, 12, 13] },
    hints: ["Primero el más chiquito.", "Cada número que sigue es uno más."],
    explanation: "En orden: 11, 12, 13.",
    difficulty: 1,
    xpReward: 7,
  },
];

const readingInitialPreviewExercises: ExerciseSeed[] = [
  {
    kind: ExerciseKind.TEACH,
    order: 0,
    prompt: "",
    payload: {
      teach: {
        beats: [
          {
            emoji: "🔤",
            repeat: 1,
            text: "Esta prueba muestra cómo Paskalito ayuda a reconocer letras, sonidos y trazos.",
          },
        ],
        tryIt: {
          emoji: "A",
          count: 1,
          text: "Toca la A para empezar.",
          successText: "¡Vamos con las vocales!",
        },
      },
    } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  },
  {
    kind: ExerciseKind.MATCH,
    order: 1,
    prompt: "Une cada vocal con su pareja.",
    payload: {
      visual: "same-match",
      left: [
        { id: "A", emoji: "A" },
        { id: "E", emoji: "E" },
        { id: "I", emoji: "I" },
      ],
      right: [
        { id: "E", emoji: "E" },
        { id: "I", emoji: "I" },
        { id: "A", emoji: "A" },
      ],
    } as Prisma.InputJsonValue,
    solution: { pairs: [[0, 2], [1, 0], [2, 1]] },
    hints: ["Busca la misma letra.", "Toca una tarjeta y después su pareja."],
    explanation: "Cada vocal encontró otra igual.",
    difficulty: 1,
    xpReward: 6,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 2,
    prompt: "Toca la letra A.",
    payload: { visual: "letter", letter: "A", options: ["A", "E", "I", "O"] } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Busca la tarjeta que tiene la A.", "Mira su forma antes de tocar."],
    explanation: "Esa es la letra A. Primero la reconocemos, después la trazamos.",
    difficulty: 1,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 3,
    prompt: "¿Con qué letra empieza abeja?",
    payload: { visual: "emoji-word", emoji: "🐝", label: "abeja", options: ["A", "E", "I", "O"] } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Di la palabra despacio: abeja.", "Escucha el primer sonido: A."],
    explanation: "Abeja empieza con A.",
    difficulty: 1,
    xpReward: 6,
  },
  {
    kind: ExerciseKind.DRAW,
    order: 4,
    prompt: "Traza la letra A con el dedo",
    payload: { letter: "A" } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Sigue la guía despacito.", "Puedes levantar el dedo si la letra tiene más de un trazo."],
    explanation: "Así se escribe la A en imprenta mayúscula.",
    difficulty: 1,
    xpReward: 6,
  },
];

const letterTracingPreviewExercises: ExerciseSeed[] = [
  {
    kind: ExerciseKind.TEACH,
    order: 0,
    prompt: "",
    payload: {
      teach: {
        beats: [
          {
            emoji: "A",
            repeat: 1,
            text: "Esta es la letra A. Primero la miramos, luego la trazamos con el dedo.",
          },
        ],
        tryIt: {
          emoji: "🐝",
          count: 1,
          text: "Abeja empieza con A. Toca la imagen.",
          successText: "¡A de abeja!",
        },
      },
    } as Prisma.InputJsonValue,
    solution: {},
    difficulty: 1,
    xpReward: 0,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 1,
    prompt: "Toca la letra A.",
    payload: { visual: "letter", letter: "A", options: ["A", "E", "I", "O"] } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Busca la tarjeta que tiene la A.", "Mira su forma antes de tocar."],
    explanation: "Esa es la letra A. Primero la reconocemos, después la trazamos.",
    difficulty: 1,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    order: 2,
    prompt: "¿Con qué letra empieza abeja?",
    payload: { visual: "emoji-word", emoji: "🐝", label: "abeja", options: ["A", "E", "I", "O"] } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Di la palabra despacio: abeja.", "Escucha el primer sonido: A."],
    explanation: "Abeja empieza con A.",
    difficulty: 1,
    xpReward: 5,
  },
  {
    kind: ExerciseKind.DRAW,
    order: 3,
    prompt: "Traza la letra A con el dedo",
    payload: { letter: "A" } as Prisma.InputJsonValue,
    solution: { answer: "A" },
    hints: ["Sigue la guía despacito.", "Puedes levantar el dedo si la letra tiene más de un trazo."],
    explanation: "Así se escribe la A en imprenta mayúscula.",
    difficulty: 1,
    xpReward: 6,
  },
];

const previewExerciseUpdates = [
  {
    unitSlug: "antes-de-contar",
    lessonSlug: "emparejar-iguales",
    exercises: mathInitialPreviewExercises,
  },
  {
    unitSlug: "conocer-el-cero",
    lessonSlug: "trazar-0",
    exercises: numberTracingPreviewExercises,
  },
  {
    unitSlug: "p1-numeros-hasta-20",
    lessonSlug: "contar-hasta-20",
    exercises: primaryOnePreviewExercises,
  },
  {
    unitSlug: "letras-sonidos",
    lessonSlug: "reconocer-vocales",
    exercises: readingInitialPreviewExercises,
  },
  {
    unitSlug: "vocales-mayusculas",
    lessonSlug: "trazar-a",
    exercises: letterTracingPreviewExercises,
  },
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

  for (const preview of previewExerciseUpdates) {
    const previewUnit = unitBySlug.get(preview.unitSlug);
    if (!previewUnit) throw new Error(`Missing preview unit ${preview.unitSlug}`);
    const previewLesson = await prisma.lesson.findUnique({
      where: {
        unitId_slug: {
          unitId: previewUnit.id,
          slug: preview.lessonSlug,
        },
      },
      select: { id: true },
    });
    if (!previewLesson) throw new Error(`Missing preview lesson ${preview.lessonSlug}`);

    const existingPreviewExercises = await prisma.exercise.findMany({
      where: { lessonId: previewLesson.id },
      orderBy: { order: "asc" },
      select: { id: true },
    });

    for (const [index, exercise] of preview.exercises.entries()) {
      const data = { ...exercise, order: index };
      const existing = existingPreviewExercises[index];
      if (existing) {
        await prisma.exercise.update({
          where: { id: existing.id },
          data,
        });
      } else {
        await prisma.exercise.create({
          data: { ...data, lessonId: previewLesson.id },
        });
      }
    }
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
