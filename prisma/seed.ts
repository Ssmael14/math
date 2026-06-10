// prisma/seed.ts
// Corre con: npm run db:seed
//
// Currículo CURADO estilo Brilliant para Matemáticas "Primero" (4-6 años,
// pre-lectores). Principios:
//  - Un concepto por lección.
//  - Intuición primero: cada lección abre con un momento del personaje (TEACH).
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

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PRODUCTION_SEED !== "true") {
  throw new Error(
    "Refusing to run destructive seed in production. Set ALLOW_PRODUCTION_SEED=true only for an intentional production content reset.",
  );
}

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
    prompt: "Toca cada uno y cuenta. ¿Cuántos hay?",
    payload: { visual: "count", item, count: n },
    solution: { answer: n },
    hints: [hint, "Toca uno por uno, sin saltarte ninguno."],
    explanation: `Hay ${n}. El último número que dices indica cuántos hay.`,
    difficulty: n <= 5 ? 1 : 2,
    xpReward: 5,
  };
}

function add(a: number, b: number, item: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: `Junta ${a} y ${b} en la canasta. ¿Cuántos hay en total?`,
    payload: { visual: "drag", a, b, item },
    solution: { answer: a + b },
    hints: [`Junta los ${a} y los ${b} en la canasta.`, "Después cuenta todo lo que hay adentro."],
    explanation: `${a} + ${b} = ${a + b}. Juntar dos grupos es sumar.`,
    difficulty: a + b <= 5 ? 1 : 2,
    xpReward: 7,
  };
}

function sub(total: number, removed: number, item: string): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: `Hay ${total}. Saca ${removed}. ¿Cuántos quedan?`,
    payload: { visual: "subtract", total, removed, item },
    solution: { answer: total - removed },
    hints: [`Toca ${removed} para sacarlos.`, "Después cuenta los que quedaron."],
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
    prompt: `Traza el número ${digit} con el dedo`,
    payload: { digit },
    solution: { answer: digit },
    hints: ["Sigue la guía despacito, sin levantar el dedo si no hace falta."],
    explanation: `Así se escribe el ${digit}. ¡Cada vez te sale mejor!`,
    difficulty: 2,
    xpReward: 6,
  };
}

function numberCard(digit: number): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: `Toca el número ${digit}.`,
    payload: { visual: "number-card", digit },
    solution: { answer: digit },
    hints: [`Busca la tarjeta que tiene el ${digit}.`, "Mira la forma del número."],
    explanation: `Ese es el número ${digit}. Primero lo reconocemos, después lo trazamos.`,
    difficulty: digit <= 5 ? 1 : 2,
    xpReward: 5,
  };
}

function emptyGroup(): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt: "La caja está vacía. ¿Cuántas cosas hay?",
    payload: { visual: "empty-box", item: "⭐" },
    solution: { answer: 0 },
    hints: ["No hay ninguna estrella.", "Cuando no hay nada, usamos cero."],
    explanation: "Cero significa que no hay ninguna cosa.",
    difficulty: 1,
    xpReward: 5,
  };
}

function order(numbers: number[]): Omit<Ex, "lessonId" | "order"> {
  const sequence = [...numbers].sort((a, b) => a - b);
  return {
    kind: ExerciseKind.SORT,
    prompt: "Ordena de menor a mayor",
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
    prompt: "Une cada grupo con su número",
    payload: { groups, options },
    solution: { pairs },
    hints: ["Cuenta los de cada grupo.", "Después toca su número."],
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
    hints: ["Busca el mismo dibujo.", "Toca una tarjeta y después su pareja."],
    explanation,
    difficulty: 1,
    xpReward: 6,
  };
}

function sortByAttribute(
  attribute: string,
  items: SortItem[],
  categories: SortCategory[],
  prompt = "Pon cada cosa en su canasta.",
  difficulty = 1,
): Omit<Ex, "lessonId" | "order"> {
  const groups = Object.fromEntries(categories.map((c) => [c.id, items.filter((i) => i.category === c.id).map((i) => i.id)]));
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt,
    payload: { visual: "sort-attribute", attribute, items, categories },
    solution: { groups },
    hints: ["Mira una característica a la vez.", "Si se parece a la canasta, va ahí."],
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
    prompt: attribute === "same" ? "¿Son iguales?" : "Toca el que corresponde.",
    payload: { visual: "compare-attribute", attribute, left, right, options: ["izquierda", "derecha", "igual"] },
    solution: { answer },
    hints: ["Míralos despacio.", "Compara solo lo que Paskalito pidió."],
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
    prompt: "Ordena las tarjetas.",
    payload: { visual: "order-objects", attribute, objects },
    solution: { sequence },
    hints: ["Empieza por el más pequeño o corto.", "Después busca el que sigue."],
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
    hints: ["Di el patrón en voz baja.", "Busca qué parte se repite."],
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
    prompt: "Mira rápido. ¿Cuántos viste?",
    payload: { visual: "flash-quantity", item, count: n, arrangement, durationMs: 1200, options },
    solution: { answer: n },
    hints: ["No cuentes uno por uno. Mira el grupo completo."],
    explanation: `Viste ${n}. A veces puedes reconocer el grupo completo.`,
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
    hints: ["No desapareció nada.", "Cuenta si quieres comprobar."],
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
    hints: ["Mira los dos grupos.", "Puedes tocar y contar para comprobar."],
    explanation: answer === "igual" ? "Hay la misma cantidad." : `Hay más en la ${answer}.`,
    difficulty: Math.max(left.count, right.count) <= 5 ? 1 : 2,
    xpReward: 7,
  };
}

function partWhole(total: number, item: string, parts: number[]): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: `Separa el grupo en ${parts[0]} y ${parts[1]}.`,
    payload: { visual: "part-whole", total, item, parts },
    solution: { total, parts },
    hints: ["Pon algunas cosas en una parte y otras en la otra.", "Las dos partes juntas forman el grupo completo."],
    explanation: `${parts[0]} y ${parts[1]} forman ${total}. Un grupo puede separarse en partes.`,
    difficulty: total <= 4 ? 1 : 2,
    xpReward: 8,
  };
}

function choiceNumber(
  prompt: string,
  visual: string,
  payload: Record<string, Prisma.InputJsonValue>,
  answer: number,
  hints: string[],
  explanation: string,
  difficulty = 2,
  xpReward = 7,
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt,
    payload: { visual, ...payload } as Prisma.InputJsonValue,
    solution: { answer },
    hints,
    explanation,
    difficulty,
    xpReward,
  };
}

function choiceText(
  prompt: string,
  visual: string,
  payload: Record<string, Prisma.InputJsonValue>,
  options: string[],
  answer: string,
  hints: string[],
  explanation: string,
  difficulty = 2,
  xpReward = 7,
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.MULTIPLE_CHOICE,
    prompt,
    payload: { visual, ...payload, options } as Prisma.InputJsonValue,
    solution: { answer },
    hints,
    explanation,
    difficulty,
    xpReward,
  };
}

function placeValue(
  value: number,
  tens: number,
  ones: number,
  prompt = `Forma ${value} con decenas y unidades.`,
): Omit<Ex, "lessonId" | "order"> {
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt,
    payload: { visual: "base-ten-build", target: value, tens, ones } as Prisma.InputJsonValue,
    solution: { answer: value },
    hints: ["Toca + 1 decena para agregar grupos de diez.", "Toca + 1 unidad para agregar unidades sueltas."],
    explanation: `${tens} decena${tens === 1 ? "" : "s"} y ${ones} unidad${ones === 1 ? "" : "es"} forman ${value}.`,
    difficulty: 2,
    xpReward: 8,
  };
}

function numberLine(
  sequence: Array<number | null>,
  answer: number,
  step = 1,
): Omit<Ex, "lessonId" | "order"> {
  const distractors = [answer - step, answer + step, answer + step * 2]
    .filter((value) => value > 0);
  const choices = [...new Set([answer, ...distractors])].slice(0, 4).sort((a, b) => a - b);
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: "Pon el número que falta en la recta.",
    payload: { visual: "number-line-input", sequence, choices, step } as Prisma.InputJsonValue,
    solution: { answer },
    hints: [`La secuencia avanza de ${step} en ${step}.`, "Mira el número anterior y el siguiente."],
    explanation: `Falta ${answer}. La secuencia mantiene el mismo salto.`,
    difficulty: Math.max(...sequence.filter((n): n is number => typeof n === "number")) <= 20 ? 1 : 2,
    xpReward: 8,
  };
}

function ordinal(
  items: string[],
  targetIndex: number,
  answer: string,
): Omit<Ex, "lessonId" | "order"> {
  return choiceText(
    "¿Qué lugar ocupa el marcado?",
    "ordinal-line",
    { items, targetIndex },
    ["primero", "segundo", "tercero", "cuarto", "quinto"],
    answer,
    ["Cuenta los lugares desde la izquierda.", "El lugar no dice cuántos hay, dice posición."],
    `El marcado está en el lugar ${answer}.`,
    2,
    7,
  );
}

function equalGroups(
  groups: number,
  size: number,
  item: string,
): Omit<Ex, "lessonId" | "order"> {
  const total = groups * size;
  return choiceNumber(
    `Hay ${groups} grupos de ${size}. ¿Cuántos hay en total?`,
    "picture-graph",
    {
      rows: Array.from({ length: groups }).map((_, i) => ({
        label: `Grupo ${i + 1}`,
        icon: item,
        count: size,
      })) as Prisma.InputJsonValue,
    },
    total,
    ["Cuenta por grupos iguales.", "También puedes contar todos uno por uno para comprobar."],
    `${groups} grupos de ${size} forman ${total}. Esa es la idea de multiplicar.`,
    2,
    8,
  );
}

function shareEqually(total: number, groups: number, item: string): Omit<Ex, "lessonId" | "order"> {
  const each = total / groups;
  return choiceNumber(
    `Reparte ${total} en ${groups} grupos iguales. ¿Cuántos van en cada grupo?`,
    "picture-graph",
    { rows: [{ label: "Todo", icon: item, count: total }] as Prisma.InputJsonValue },
    each,
    ["Reparte uno por uno en cada grupo.", "Todos los grupos deben quedar iguales."],
    `${total} repartidos en ${groups} grupos iguales da ${each} en cada grupo.`,
    2,
    8,
  );
}

function money(coins: number[], answer: number): Omit<Ex, "lessonId" | "order"> {
  const coinOptions = [...new Set([...coins, 1, 2, 5])].sort((a, b) => a - b);
  return {
    kind: ExerciseKind.DRAG_DROP,
    prompt: `Arma S/${answer} con monedas.`,
    payload: { visual: "money-build", target: answer, coinOptions } as Prisma.InputJsonValue,
    solution: { answer },
    hints: ["Toca monedas para agregarlas al monedero.", "Puedes tocar una moneda del monedero para quitarla."],
    explanation: `Una forma de armar S/${answer} es usar ${coins.map((coin) => `S/${coin}`).join(" + ")}.`,
    difficulty: 2,
    xpReward: 8,
  };
}

function lengthBars(
  bars: { id: string; label: string; length: number; color?: string }[],
  answer: string,
  prompt = "¿Cuál es más largo?",
): Omit<Ex, "lessonId" | "order"> {
  return choiceText(
    prompt,
    "length-bars",
    { bars: bars as Prisma.InputJsonValue },
    bars.map((bar) => bar.label),
    answer,
    ["Compara desde el mismo inicio.", "Mira cuál barra llega más lejos."],
    `${answer} es la respuesta correcta al comparar las longitudes.`,
    2,
    7,
  );
}

function clock(time: string, answer: string, options: string[]): Omit<Ex, "lessonId" | "order"> {
  return choiceText(
    "¿Qué hora muestra el reloj?",
    "clock",
    { time },
    options,
    answer,
    ["Mira la hora y los minutos.", "Cuando termina en :30 decimos y media."],
    `El reloj muestra ${answer}.`,
    2,
    7,
  );
}

function shapeChoice(
  prompt: string,
  shapes: { symbol: string; label?: string; color?: string }[],
  options: string[],
  answer: string,
): Omit<Ex, "lessonId" | "order"> {
  return choiceText(
    prompt,
    "shapes",
    { shapes: shapes as Prisma.InputJsonValue },
    options,
    answer,
    ["Mira los lados y las esquinas.", "Nombra la forma antes de elegir."],
    `La respuesta es ${answer}.`,
    2,
    7,
  );
}

function pictureGraph(
  prompt: string,
  rows: { label: string; icon: string; count: number }[],
  answer: number,
): Omit<Ex, "lessonId" | "order"> {
  return choiceNumber(
    prompt,
    "picture-graph",
    { rows: rows as Prisma.InputJsonValue },
    answer,
    ["Cuenta los dibujos de la fila que te preguntan.", "Cada dibujo vale uno."],
    `La respuesta es ${answer}.`,
    2,
    7,
  );
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

const traceItems = ["⭐", "🍎", "🐟", "🍓", "🧁", "🌼", "🚗", "🎈", "🟦", "🧸"];

function digitKeycap(digit: number) {
  return `${digit}\uFE0F\u20E3`;
}

async function traceDigitLesson(unitId: string, digit: number, order: number) {
  const item = traceItems[digit] ?? "⭐";
  await lesson(
    unitId,
    {
      slug: `trazar-${digit}`,
      title: `Trazar ${digit}`,
      order,
      xpReward: digit <= 5 ? 24 : 26,
      minutes: 6,
    },
    [
      lumi(
        [
          {
            emoji: digitKeycap(digit),
            repeat: 1,
            text:
              digit === 0
                ? "El cero nos dice que no hay nada. También podemos trazar su forma redonda."
                : `Primero reconocemos el ${digit}. Después lo trazamos con el dedo.`,
          },
        ],
        {
          emoji: digitKeycap(digit),
          count: 1,
          text: `Toca el número ${digit}.`,
          successText: "¡Listo para trazar!",
        },
      ),
      numberCard(digit),
      digit === 0
        ? emptyGroup()
        : count(item, digit, `Cuenta ${digit} ${digit === 1 ? "objeto" : "objetos"} antes de trazar.`),
      trace(digit),
    ],
  );
}

async function seedPrimaryOnePath(subjectId: string) {
  const path = await prisma.learningPath.create({
    data: {
      subjectId,
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
  });

  const n20 = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-numeros-hasta-20",
      title: "Números hasta 20",
      description: "Contar, leer, comparar, ordenar y ubicar números hasta 20.",
      order: 1,
      color: "sky",
      icon: "🔢",
    },
  });

  await lesson(n20.id, { slug: "contar-hasta-20", title: "Contar hasta 20", order: 1, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🔢", repeat: 1, text: "En primero seguimos contando más allá de diez, sin apurarnos." }], { emoji: "⭐", count: 5, text: "Toca cinco estrellas para empezar.", successText: "¡Listo para contar!" }),
    count("⭐", 12, "Cuenta primero diez y después dos más."),
    count("🍎", 15, "Puedes contar en dos filas para no perderte."),
    numberLine([10, 11, null, 13, 14], 12),
    order([16, 12, 18, 14, 20]),
  ]);

  await lesson(n20.id, { slug: "leer-numeros-20", title: "Leer números hasta 20", order: 2, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "👀", repeat: 1, text: "Leer un número es reconocer su forma y decir cómo se llama." }], { emoji: "1️⃣", count: 1, text: "Toca la tarjeta para mirar el número.", successText: "¡Ojos atentos!" }),
    numberCard(14),
    choiceText("¿Cómo se lee 16?", "number-card", { digit: 16 }, ["dieciséis", "seis", "sesenta", "diez"], "dieciséis", ["Mira el 1 y el 6 juntos.", "Está entre quince y diecisiete."], "16 se lee dieciséis.", 2, 7),
    choiceText("¿Cómo se lee 20?", "number-card", { digit: 20 }, ["doce", "veinte", "dos", "diez"], "veinte", ["Tiene un 2 y un 0.", "Viene después de diecinueve."], "20 se lee veinte.", 2, 7),
    numberLine([16, 17, 18, null, 20], 19),
  ]);

  await lesson(n20.id, { slug: "comparar-hasta-20", title: "Comparar hasta 20", order: 3, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "⚖️", repeat: 1, text: "Comparar es mirar qué número o grupo es mayor, menor o igual." }], { emoji: "🍎", count: 4, text: "Mira los dos lados antes de elegir.", successText: "¡Comparaste!" }),
    compareGroups({ item: "🍎", count: 9 }, { item: "🍎", count: 12 }),
    compare(18, 13),
    compare(15, 15),
    order([19, 11, 17, 13, 15]),
  ]);

  await lesson(n20.id, { slug: "ordinales-primero-decimo", title: "Primero a décimo", order: 4, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "🏁", repeat: 1, text: "Los ordinales dicen el lugar: primero, segundo, tercero..." }], { emoji: "🚗", count: 3, text: "Toca tres autos en la carrera.", successText: "¡Carrera lista!" }),
    ordinal(["🚗", "🚕", "🚙", "🚌", "🚓"], 0, "primero"),
    ordinal(["🚗", "🚕", "🚙", "🚌", "🚓"], 2, "tercero"),
    ordinal(["🚗", "🚕", "🚙", "🚌", "🚓"], 4, "quinto"),
    choiceText("Si estás después del tercero, ¿qué lugar eres?", "number-line", { sequence: [1, 2, 3, null, 5] }, ["segundo", "cuarto", "quinto", "primero"], "cuarto", ["Cuenta los lugares en orden.", "Después del tercero viene el cuarto."], "Después del tercero viene el cuarto.", 2, 7),
  ]);

  const pv100 = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-decenas-unidades",
      title: "Decenas y unidades",
      description: "Formar números hasta 100 con grupos de diez y unidades.",
      order: 2,
      color: "mint",
      icon: "🧱",
    },
  });

  await lesson(pv100.id, { slug: "hacer-una-decena", title: "Hacer una decena", order: 1, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🧱", repeat: 1, text: "Una decena es un grupo de diez unidades." }], { emoji: "●", count: 10, text: "Toca diez puntos para armar una decena.", successText: "¡Una decena!" }),
    count("●", 10, "Diez unidades forman una decena."),
    placeValue(10, 1, 0),
    placeValue(13, 1, 3),
    placeValue(18, 1, 8),
  ]);

  await lesson(pv100.id, { slug: "valor-posicional", title: "Valor posicional", order: 2, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🏠", repeat: 1, text: "Cada dígito tiene una casa: decenas y unidades." }], { emoji: "🧱", count: 2, text: "Toca dos bloques de decena.", successText: "¡Dos decenas!" }),
    placeValue(24, 2, 4),
    placeValue(36, 3, 6),
    choiceNumber("Hay 4 decenas y 2 unidades. ¿Qué número es?", "place-value", { tens: 4, ones: 2 }, 42, ["Cuatro decenas son 40.", "40 y 2 forman 42."], "4 decenas y 2 unidades forman 42.", 2, 7),
    choiceNumber("Hay 5 decenas y 0 unidades. ¿Qué número es?", "place-value", { tens: 5, ones: 0 }, 50, ["Cinco decenas son cinco grupos de diez.", "No hay unidades sueltas."], "5 decenas forman 50.", 2, 7),
  ]);

  await lesson(pv100.id, { slug: "ordenar-hasta-100", title: "Ordenar hasta 100", order: 3, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🪜", repeat: 1, text: "Para ordenar números grandes miramos primero las decenas." }], { emoji: "🪜", count: 1, text: "Toca la escalera.", successText: "¡Subimos!" }),
    order([21, 12, 31, 41]),
    order([55, 25, 45, 35]),
    numberLine([60, 70, null, 90, 100], 80, 10),
    compare(76, 67),
  ]);

  await lesson(pv100.id, { slug: "patrones-numericos", title: "Patrones numéricos", order: 4, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🔁", repeat: 1, text: "Algunos patrones saltan de 2 en 2, de 5 en 5 o de 10 en 10." }], { emoji: "👣", count: 2, text: "Toca dos pasos.", successText: "¡Saltamos!" }),
    numberLine([2, 4, 6, null, 10], 8, 2),
    numberLine([5, 10, 15, null, 25], 20, 5),
    numberLine([10, 20, 30, null, 50], 40, 10),
    patternNext(["10", "20", "30", "10", "20", "30"], ["10", "20", "30"], "10", 2),
  ]);

  const addSub = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-sumas-restas",
      title: "Sumar y restar",
      description: "Juntar, sacar y ver la relación entre suma y resta.",
      order: 3,
      color: "sun",
      icon: "➕",
    },
  });

  await lesson(addSub.id, { slug: "sumar-hasta-20", title: "Sumar hasta 20", order: 1, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Sumar sigue siendo juntar grupos, ahora con números más grandes." }], { emoji: "🍎", count: 5, text: "Toca el grupo que vamos a juntar.", successText: "¡A juntar!" }),
    add(6, 4, "🍎"),
    add(8, 5, "⭐"),
    choiceNumber("Junta 9 y 6. ¿Cuántos hay en total?", "picture-graph", { rows: [{ label: "Grupo 1", icon: "●", count: 9 }, { label: "Grupo 2", icon: "●", count: 6 }] }, 15, ["Primero puedes hacer 10.", "9 necesita 1 para llegar a 10; quedan 5 más."], "9 + 6 = 15.", 2, 8),
    numberLine([12, 13, 14, null, 16], 15),
  ]);

  await lesson(addSub.id, { slug: "restar-hasta-20", title: "Restar hasta 20", order: 2, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "✋", repeat: 1, text: "Restar es sacar o encontrar cuánto queda." }], { emoji: "⭐", count: 5, text: "Toca los que quedan.", successText: "¡Quedaron!" }),
    sub(12, 2, "🍎"),
    sub(15, 5, "⭐"),
    sub(18, 6, "●"),
    choiceNumber("Tenías 17 y sacaste 7. ¿Cuántos quedan?", "subtract", { total: 17, removed: 7, item: "●" }, 10, ["Saca siete.", "Cuenta los que quedan."], "17 − 7 = 10.", 2, 8),
  ]);

  await lesson(addSub.id, { slug: "sumar-restar-hasta-100", title: "Sumar y restar decenas", order: 3, xpReward: 36, minutes: 8 }, [
    lumi([{ emoji: "🧱", repeat: 1, text: "Con decenas podemos sumar y restar más rápido." }], { emoji: "🧱", count: 3, text: "Toca tres decenas.", successText: "¡Treinta!" }),
    choiceNumber("20 y 30 juntos. ¿Cuánto es?", "place-value", { tens: 5, ones: 0 }, 50, ["Dos decenas y tres decenas son cinco decenas.", "Cinco decenas son 50."], "20 + 30 = 50.", 2, 8),
    choiceNumber("46 + 3. ¿Cuánto es?", "place-value", { tens: 4, ones: 9 }, 49, ["Las decenas quedan igual.", "6 unidades y 3 unidades son 9."], "46 + 3 = 49.", 2, 8),
    choiceNumber("58 − 5. ¿Cuánto queda?", "place-value", { tens: 5, ones: 3 }, 53, ["Las decenas quedan igual.", "8 unidades menos 5 son 3."], "58 − 5 = 53.", 2, 8),
    numberLine([70, null, 90, 100], 80, 10),
  ]);

  await lesson(addSub.id, { slug: "familias-de-hechos", title: "Familias de suma y resta", order: 4, xpReward: 36, minutes: 8 }, [
    lumi([{ emoji: "🔄", repeat: 1, text: "La suma y la resta son operaciones conectadas." }], { emoji: "🔄", count: 1, text: "Toca la flecha para ver la conexión.", successText: "¡Conectadas!" }),
    partWhole(8, "⭐", [3, 5]),
    choiceNumber("Si 3 + 5 = 8, entonces 8 − 5 = ¿?", "part-whole", { total: 8, item: "⭐", parts: [3, 5] }, 3, ["Mira las partes.", "Si sacas una parte, queda la otra."], "8 − 5 = 3.", 2, 8),
    partWhole(10, "🍎", [4, 6]),
    choiceNumber("Si 4 + 6 = 10, entonces 10 − 4 = ¿?", "part-whole", { total: 10, item: "🍎", parts: [4, 6] }, 6, ["Usa la misma familia.", "10 se separa en 4 y 6."], "10 − 4 = 6.", 2, 8),
  ]);

  const multDiv = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-grupos-iguales",
      title: "Grupos iguales",
      description: "Primeras ideas de multiplicar y dividir con objetos.",
      order: 4,
      color: "peach",
      icon: "🧺",
    },
  });

  await lesson(multDiv.id, { slug: "contar-grupos-iguales", title: "Contar grupos iguales", order: 1, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Cuando los grupos tienen la misma cantidad, podemos contar por grupos." }], { emoji: "🍪", count: 2, text: "Toca dos galletas en cada plato.", successText: "¡Grupos iguales!" }),
    equalGroups(2, 3, "🍪"),
    equalGroups(3, 4, "⭐"),
    equalGroups(4, 2, "🍎"),
    numberLine([4, 8, null, 16], 12, 4),
  ]);

  await lesson(multDiv.id, { slug: "arreglos-y-filas", title: "Filas y columnas", order: 2, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🔲", repeat: 1, text: "Un arreglo ordena objetos en filas y columnas." }], { emoji: "●", count: 4, text: "Toca una fila de puntos.", successText: "¡Fila lista!" }),
    equalGroups(2, 5, "●"),
    equalGroups(5, 2, "●"),
    choiceNumber("3 filas con 3 puntos en cada fila. ¿Cuántos puntos hay?", "picture-graph", { rows: [{ label: "Fila 1", icon: "●", count: 3 }, { label: "Fila 2", icon: "●", count: 3 }, { label: "Fila 3", icon: "●", count: 3 }] }, 9, ["Cuenta 3, 6, 9.", "Todas las filas tienen la misma cantidad."], "3 filas de 3 forman 9.", 2, 8),
    compareGroups({ item: "●", count: 10 }, { item: "●", count: 9 }),
  ]);

  await lesson(multDiv.id, { slug: "repartir-en-partes-iguales", title: "Repartir en partes iguales", order: 3, xpReward: 36, minutes: 8 }, [
    lumi([{ emoji: "🤝", repeat: 1, text: "Dividir empieza repartiendo para que todos reciban igual." }], { emoji: "🍪", count: 4, text: "Toca las galletas para repartir.", successText: "¡A repartir!" }),
    shareEqually(6, 2, "🍪"),
    shareEqually(8, 4, "⭐"),
    shareEqually(10, 2, "🍎"),
    partWhole(12, "●", [6, 6]),
  ]);

  const measure = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-medicion-tiempo-dinero",
      title: "Medir, tiempo y dinero",
      description: "Comparar longitudes, leer horas y contar monedas.",
      order: 5,
      color: "lilac",
      icon: "📏",
    },
  });

  await lesson(measure.id, { slug: "contar-dinero", title: "Contar dinero", order: 1, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "🪙", repeat: 1, text: "El dinero también se cuenta. Cada moneda tiene un valor." }], { emoji: "🪙", count: 3, text: "Toca tres monedas.", successText: "¡Monedas listas!" }),
    money([1, 1, 1], 3),
    money([2, 2, 1], 5),
    money([5, 2, 1], 8),
    compare(10, 7),
  ]);

  await lesson(measure.id, { slug: "comparar-longitudes", title: "Comparar longitudes", order: 2, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "📏", repeat: 1, text: "Para comparar longitudes, las barras empiezan en el mismo lugar." }], { emoji: "✏️", count: 2, text: "Toca dos lápices.", successText: "¡Comparamos!" }),
    lengthBars([{ id: "rojo", label: "rojo", length: 8, color: "bg-pink" }, { id: "azul", label: "azul", length: 12, color: "bg-sky" }], "azul"),
    lengthBars([{ id: "corto", label: "corto", length: 6, color: "bg-mint" }, { id: "largo", label: "largo", length: 14, color: "bg-sun" }], "largo"),
    orderObjects("length", [{ id: "s", emoji: "✏️", label: "A", size: 1 }, { id: "l", emoji: "✏️", label: "C", size: 3 }, { id: "m", emoji: "✏️", label: "B", size: 2 }], ["s", "m", "l"], 2),
    choiceNumber("Una línea mide 7 cm. Otra mide 4 cm. ¿Cuántos cm más mide la larga?", "length-bars", { bars: [{ id: "larga", label: "7 cm", length: 7 }, { id: "corta", label: "4 cm", length: 4 }] }, 3, ["Compara 7 con 4.", "Cuenta de 4 a 7."], "7 cm es 3 cm más que 4 cm.", 2, 8),
  ]);

  await lesson(measure.id, { slug: "leer-horas", title: "Leer horas", order: 3, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "🕒", repeat: 1, text: "El reloj nos ayuda a saber cuándo pasan las cosas." }], { emoji: "🕒", count: 1, text: "Toca el reloj.", successText: "¡Hora de aprender!" }),
    clock("3:00", "3:00", ["2:00", "3:00", "3:30", "4:00"]),
    clock("7:30", "7:30", ["7:00", "7:30", "8:00", "8:30"]),
    clock("9:15", "9:15", ["9:05", "9:15", "9:30", "10:15"]),
    choiceText("Media hora después de 2:00 es...", "clock", { time: "2:00" }, ["2:05", "2:30", "3:00", "1:30"], "2:30", ["Media hora son 30 minutos.", "Después de 2:00 viene 2:30."], "Media hora después de 2:00 es 2:30.", 2, 8),
  ]);

  const shapesData = await prisma.unit.create({
    data: {
      learningPathId: path.id,
      slug: "p1-formas-y-datos",
      title: "Formas y datos",
      description: "Reconocer figuras, construir dibujos y leer pictogramas.",
      order: 6,
      color: "rose",
      icon: "🔷",
    },
  });

  await lesson(shapesData.id, { slug: "formas-2d", title: "Figuras 2D", order: 1, xpReward: 32, minutes: 7 }, [
    lumi([{ emoji: "🔷", repeat: 1, text: "Las figuras tienen nombres, lados y esquinas." }], { emoji: "🔺", count: 1, text: "Toca el triángulo.", successText: "¡Triángulo!" }),
    shapeChoice("¿Cuál figura es un círculo?", [{ symbol: "●", label: "A" }, { symbol: "■", label: "B" }, { symbol: "▲", label: "C" }], ["A", "B", "C"], "A"),
    shapeChoice("¿Cuál figura tiene tres lados?", [{ symbol: "▲", label: "A" }, { symbol: "●", label: "B" }, { symbol: "■", label: "C" }], ["A", "B", "C"], "A"),
    sortByAttribute("shape", [{ id: "circle1", emoji: "🔵", category: "circle" }, { id: "square1", emoji: "🟩", category: "square" }, { id: "triangle1", emoji: "🔺", category: "triangle" }, { id: "circle2", emoji: "🟡", category: "circle" }], [{ id: "circle", label: "Círculos" }, { id: "square", label: "Cuadrados" }, { id: "triangle", label: "Triángulos" }], "Clasifica las figuras.", 2),
    sameMatch("Une cada figura con otra igual.", [{ id: "circle", emoji: "🔵" }, { id: "square", emoji: "🟩" }, { id: "triangle", emoji: "🔺" }], [{ id: "triangle", emoji: "🔺" }, { id: "circle", emoji: "🔵" }, { id: "square", emoji: "🟩" }], "Cada figura encontró su pareja."),
  ]);

  await lesson(shapesData.id, { slug: "crear-figuras", title: "Crear figuras", order: 2, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🧩", repeat: 1, text: "Podemos formar dibujos juntando figuras." }], { emoji: "🧩", count: 3, text: "Toca tres piezas.", successText: "¡A construir!" }),
    shapeChoice("¿Qué figuras forman una casa simple?", [{ symbol: "▲", label: "techo" }, { symbol: "■", label: "pared" }], ["triángulo y cuadrado", "dos círculos", "solo triángulos", "dos líneas"], "triángulo y cuadrado"),
    shapeChoice("¿Qué figura ves en la rueda?", [{ symbol: "●", label: "rueda" }, { symbol: "■", label: "ventana" }, { symbol: "▲", label: "techo" }], ["círculo", "cuadrado", "triángulo", "rectángulo"], "círculo"),
    orderObjects("size", [{ id: "small", emoji: "🔵", size: 1 }, { id: "big", emoji: "🔵", size: 3 }, { id: "medium", emoji: "🔵", size: 2 }], ["small", "medium", "big"], 2),
    patternNext(["🔵", "🟩", "🔺", "🔵", "🟩", "🔺"], ["🔵", "🟩", "🔺"], "🔵", 2),
  ]);

  await lesson(shapesData.id, { slug: "leer-pictogramas", title: "Leer pictogramas", order: 3, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "📊", repeat: 1, text: "Un pictograma usa dibujos para mostrar datos." }], { emoji: "🍎", count: 4, text: "Toca los dibujos de una fila.", successText: "¡Datos listos!" }),
    pictureGraph("¿Cuántas manzanas hay?", [{ label: "Manzanas", icon: "🍎", count: 5 }, { label: "Plátanos", icon: "🍌", count: 3 }], 5),
    pictureGraph("¿Cuántos plátanos hay?", [{ label: "Manzanas", icon: "🍎", count: 5 }, { label: "Plátanos", icon: "🍌", count: 3 }], 3),
    choiceText("¿Qué fila tiene más?", "picture-graph", { rows: [{ label: "Gatos", icon: "🐱", count: 4 }, { label: "Perros", icon: "🐶", count: 6 }] }, ["Gatos", "Perros", "Igual"], "Perros", ["Compara las dos filas.", "La fila con más dibujos gana."], "Hay más perros.", 2, 8),
    choiceNumber("¿Cuántos animales hay en total?", "picture-graph", { rows: [{ label: "Gatos", icon: "🐱", count: 4 }, { label: "Perros", icon: "🐶", count: 6 }] }, 10, ["Suma las dos filas.", "4 y 6 forman 10."], "Hay 10 animales en total.", 2, 8),
  ]);

  await lesson(shapesData.id, { slug: "repaso-primer-grado-1", title: "Repaso de 1.º grado", order: 4, xpReward: 38, minutes: 9 }, [
    lumi([{ emoji: "🎒", repeat: 1, text: "Repasamos números, operaciones, medidas, formas y datos." }], { emoji: "⭐", count: 5, text: "Toca cinco estrellas para comenzar.", successText: "¡Repaso listo!" }),
    placeValue(47, 4, 7),
    choiceNumber("18 − 8. ¿Cuánto queda?", "subtract", { total: 18, removed: 8, item: "●" }, 10, ["Saca ocho.", "Cuenta los que quedan."], "18 − 8 = 10.", 2, 8),
    money([5, 5, 2], 12),
    pictureGraph("¿Cuántas flores hay?", [{ label: "Flores", icon: "🌼", count: 7 }, { label: "Hojas", icon: "🍃", count: 4 }], 7),
  ]);
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
  // MATH · Inicial · Aventura con Paskalito
  // ============================================================
  const primary1 = await prisma.learningPath.create({
    data: {
      subjectId: mathSubject.id,
      slug: "math-initial-nel",
      name: "Inicial · Aventura con Paskalito",
      description: "Clasificar, descubrir patrones, contar, comparar, juntar y sacar — paso a paso con Paskalito.",
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
    lumi([{ emoji: "🍎", repeat: 2, text: "En el mercado de los monitos, las cosas iguales pueden ir juntas." }], { emoji: "🍌", count: 2, text: "Toca los dos plátanos iguales.", successText: "¡Son pareja!" }),
    sameMatch("Une cada fruta con su pareja.", [{ id: "apple", emoji: "🍎" }, { id: "plátano", emoji: "🍌" }, { id: "grape", emoji: "🍇" }], [{ id: "plátano", emoji: "🍌" }, { id: "grape", emoji: "🍇" }, { id: "apple", emoji: "🍎" }], "Cada fruta encontró otra igual."),
    sameMatch("Une cada animal con su pareja.", [{ id: "cat", emoji: "🐱" }, { id: "dog", emoji: "🐶" }, { id: "fish", emoji: "🐟" }], [{ id: "fish", emoji: "🐟" }, { id: "cat", emoji: "🐱" }, { id: "dog", emoji: "🐶" }], "Emparejar es buscar lo que es igual."),
    sortByAttribute("type", [{ id: "apple", emoji: "🍎", category: "fruits" }, { id: "cat", emoji: "🐱", category: "animals" }, { id: "plátano", emoji: "🍌", category: "fruits" }, { id: "dog", emoji: "🐶", category: "animals" }], [{ id: "fruits", label: "Frutas", emoji: "🍎" }, { id: "animals", label: "Animales", emoji: "🐱" }], "Pon frutas con frutas y animales con animales."),
  ]);

  await lesson(u1.id, { slug: "clasificar-por-color", title: "Canastas de colores", order: 2, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Cada canasta recibe cosas de su color." }], { emoji: "🍎", count: 1, text: "Toca la fruta roja.", successText: "¡Rojo!" }),
    sortByAttribute("color", [{ id: "apple", emoji: "🍎", category: "red" }, { id: "plátano", emoji: "🍌", category: "yellow" }, { id: "pear", emoji: "🍐", category: "green" }, { id: "cherry", emoji: "🍒", category: "red" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }, { id: "green", label: "Verdes", emoji: "🟢" }], "Pon cada fruta en su color."),
    sortByAttribute("color", [{ id: "rose", emoji: "🌹", category: "red" }, { id: "sunflower", emoji: "🌻", category: "yellow" }, { id: "tulip", emoji: "🌷", category: "red" }, { id: "blossom", emoji: "🌼", category: "yellow" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }], "Pon cada flor en su canasta."),
    sortByAttribute("color", [{ id: "strawberry", emoji: "🍓", category: "red" }, { id: "lemon", emoji: "🍋", category: "yellow" }, { id: "tomato", emoji: "🍅", category: "red" }, { id: "leaf", emoji: "🍃", category: "other" }], [{ id: "red", label: "Rojas", emoji: "🔴" }, { id: "yellow", label: "Amarillas", emoji: "🟡" }, { id: "other", label: "Otra", emoji: "✨" }], "Hay un objeto que no va con los dos colores.", 2),
  ]);

  await lesson(u1.id, { slug: "clasificar-por-tamano-forma", title: "Pequeños, grandes y formas", order: 3, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🔍", repeat: 1, text: "Miramos una característica a la vez: tamaño, forma o color." }], { emoji: "⭐", count: 1, text: "Toca la estrella para mirar mejor.", successText: "¡Detective listo!" }),
    sortByAttribute("size", [{ id: "small-star", emoji: "⭐", label: "pequeña", category: "small" }, { id: "big-star", emoji: "🌟", label: "grande", category: "big" }, { id: "small-flower", emoji: "🌸", label: "pequeña", category: "small" }, { id: "big-flower", emoji: "🌺", label: "grande", category: "big" }], [{ id: "small", label: "Pequeños" }, { id: "big", label: "Grandes" }]),
    sortByAttribute("shape", [{ id: "circle", emoji: "🔵", category: "circle" }, { id: "triangle", emoji: "🔺", category: "triangle" }, { id: "square", emoji: "🟩", category: "square" }, { id: "circle2", emoji: "🟡", category: "circle" }], [{ id: "circle", label: "Círculos" }, { id: "triangle", label: "Triángulos" }, { id: "square", label: "Cuadrados" }], "Pon cada forma con su familia."),
    compareObjects("size", { id: "small", emoji: "🧸", label: "pequeño", size: 1 }, { id: "big", emoji: "🧸", label: "grande", size: 2 }, "derecha"),
  ]);

  await lesson(u1.id, { slug: "ordenar-objetos", title: "El tren de los tamaños", order: 4, xpReward: 26, minutes: 6 }, [
    lumi([{ emoji: "🚂", repeat: 1, text: "El tren sale si los vagones están ordenados." }], { emoji: "🚃", count: 3, text: "Toca los vagones del tren.", successText: "¡A ordenar!" }),
    orderObjects("size", [{ id: "small", emoji: "🚃", size: 1 }, { id: "big", emoji: "🚃", size: 3 }, { id: "medium", emoji: "🚃", size: 2 }], ["small", "medium", "big"]),
    orderObjects("height", [{ id: "one", emoji: "🌱", size: 1 }, { id: "four", emoji: "🌳", size: 4 }, { id: "two", emoji: "🌿", size: 2 }, { id: "three", emoji: "🌲", size: 3 }], ["one", "two", "three", "four"], 2),
    orderObjects("length", [{ id: "s", emoji: "✏️", size: 1 }, { id: "xl", emoji: "✏️", size: 5 }, { id: "m", emoji: "✏️", size: 3 }, { id: "l", emoji: "✏️", size: 4 }, { id: "xs", emoji: "✏️", size: 2 }], ["s", "xs", "m", "l", "xl"], 2),
  ]);

  await lesson(u1.id, { slug: "detectives-de-patrones", title: "Detectives de patrones", order: 5, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🧩", repeat: 1, text: "Un patrón es algo que se repite." }], { emoji: "🍎", count: 2, text: "Toca el patrón: manzana, plátano.", successText: "¡Patrón encontrado!" }),
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
    lumi([{ emoji: "☝️", repeat: 1, text: "Tocamos una cosa y decimos un número. Una cosa, un toque." }], { emoji: "🍎", count: 2, text: "Toca dos manzanas, una por una.", successText: "¡Un toque para cada una!" }),
    count("🐟", 2, "Toca un pez y di uno. Toca otro y di dos."),
    count("⭐", 3, "Una estrella, un número."),
    match([{ item: "🍎", count: 1 }, { item: "⭐", count: 2 }, { item: "🐟", count: 3 }], [2, 3, 1]),
  ]);

  await lesson(u2.id, { slug: "orden-estable", title: "La canción de los números", order: 2, xpReward: 22, minutes: 5 }, [
    lumi([{ emoji: "🎵", repeat: 1, text: "La canción siempre va igual: uno, dos, tres, cuatro, cinco." }], { emoji: "🎵", count: 1, text: "Toca la nota para cantar.", successText: "¡Cantamos en orden!" }),
    order([2, 1, 3]),
    order([3, 1, 4, 2]),
    order([4, 2, 5, 1, 3]),
  ]);

  await lesson(u2.id, { slug: "cardinalidad", title: "El último dice cuántos", order: 3, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🏁", repeat: 1, text: "Cuando terminas de contar, el último número dice cuántos hay." }], { emoji: "⭐", count: 4, text: "Toca cuatro estrellas.", successText: "¡El último fue cuatro!" }),
    count("🍎", 4, "El último número te dice la cantidad."),
    count("🐟", 5, "Termina de contar y escucha el último número."),
    match([{ item: "⭐", count: 3 }, { item: "🍎", count: 4 }, { item: "🐟", count: 5 }], [5, 3, 4]),
  ]);

  await lesson(u2.id, { slug: "contar-desde-cualquier-lado", title: "Contar desde cualquier lado", order: 4, xpReward: 24, minutes: 6 }, [
    lumi([{ emoji: "🔄", repeat: 1, text: "Puedes empezar por otro lado y sigue habiendo la misma cantidad." }], { emoji: "🍓", count: 4, text: "Toca las fresas en el orden que quieras.", successText: "¡Siguen siendo cuatro!" }),
    count("🍓", 4, "Puedes empezar por la izquierda."),
    count("🍓", 4, "Puedes empezar por la derecha."),
    conservation("🍓", 4, "row", "spread"),
  ]);

  await lesson(u2.id, { slug: "repaso-contar-1-5", title: "Repaso 1 al 5", order: 5, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🖐️", repeat: 1, text: "Repasamos hasta cinco con ojos, dedos y toques." }], { emoji: "⭐", count: 5, text: "Toca cinco estrellas.", successText: "¡Llegaste a cinco!" }),
    count("🍎", 5, "Toca uno por uno."),
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
    lumi([{ emoji: "🐟", repeat: 5, text: "Ya llegamos a cinco. Ahora seguimos: seis, siete, ocho." }], { emoji: "🐟", count: 6, text: "Toca seis peces.", successText: "¡Seis!" }),
    count("🍎", 6, "Uno más que cinco."),
    count("⭐", 7, "Sigue después de seis."),
    count("🐟", 8, "Cuenta despacio hasta el final."),
  ]);

  await lesson(u3.id, { slug: "contar-9-10", title: "Contar 9 y 10", order: 2, xpReward: 26, minutes: 6 }, [
    lumi([{ emoji: "🔟", repeat: 1, text: "Diez es como tener las dos manos llenas." }], { emoji: "⭐", count: 9, text: "Toca nueve estrellas.", successText: "¡Nueve!" }),
    count("🐟", 9, "Uno menos que diez."),
    count("🍎", 10, "Las dos manos llenas."),
    match([{ item: "⭐", count: 7 }, { item: "🐟", count: 9 }, { item: "🍎", count: 10 }], [10, 7, 9]),
  ]);

  await lesson(u3.id, { slug: "ordenar-hasta-10", title: "Ordenar hasta 10", order: 3, xpReward: 28, minutes: 7 }, [
    lumi([{ emoji: "🪜", repeat: 1, text: "Los números suben como una escalera." }], { emoji: "🪜", count: 1, text: "Toca la escalera.", successText: "¡Subimos!" }),
    order([6, 7, 5]),
    order([8, 6, 7, 9]),
    order([10, 6, 8, 7, 9]),
  ]);

  await lesson(u3.id, { slug: "tarjetas-de-puntos", title: "Tarjetas de puntos", order: 4, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🎲", repeat: 1, text: "Las tarjetas de puntos ayudan a ver cantidades." }], { emoji: "•", count: 5, text: "Toca los puntos.", successText: "¡Puntos listos!" }),
    match([{ item: "•", count: 6 }, { item: "•", count: 7 }, { item: "•", count: 8 }], [8, 6, 7]),
    match([{ item: "•", count: 9 }, { item: "•", count: 10 }, { item: "•", count: 6 }], [10, 6, 9]),
    subitise("•", 5, "dice", [4, 5, 6, 3]),
  ]);

  await lesson(u3.id, { slug: "repaso-hasta-10", title: "Repaso hasta 10", order: 5, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🎒", repeat: 1, text: "Guardamos todo lo aprendido hasta diez." }], { emoji: "⭐", count: 10, text: "Toca diez estrellas.", successText: "¡Diez!" }),
    count("🍓", 8, "Cuenta sin saltarte ninguna."),
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
    lumi([{ emoji: "👀", repeat: 1, text: "A veces puedes ver cuántos hay sin contar uno por uno." }], { emoji: "⭐", count: 3, text: "Mira el grupo completo.", successText: "¡Lo viste rápido!" }),
    subitise("●", 2, "pair", [1, 2, 3, 4]),
    subitise("●", 3, "triangle", [2, 3, 4, 5]),
    subitise("●", 4, "square", [3, 4, 5, 6]),
    subitise("●", 5, "dice", [4, 5, 6, 3]),
  ]);

  await lesson(u4.id, { slug: "dados-y-dominos", title: "Dados y dominós", order: 2, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🎲", repeat: 1, text: "Los dados y dominós muestran cantidades de muchas formas." }], { emoji: "●", count: 3, text: "Mira tres puntos.", successText: "¡Tres!" }),
    subitise("●", 3, "line", [2, 3, 4, 5]),
    subitise("●", 3, "triangle", [2, 3, 4, 1]),
    subitise("●", 4, "square", [3, 4, 5, 6]),
    subitise("●", 5, "dice", [4, 5, 6, 7]),
  ]);

  await lesson(u4.id, { slug: "mago-de-las-cantidades", title: "El mago de las cantidades", order: 3, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🪄", repeat: 1, text: "Mover las cosas no cambia cuántas hay." }], { emoji: "🍎", count: 3, text: "Toca las manzanas antes y después.", successText: "¡Siguen iguales!" }),
    conservation("🍎", 3, "close", "spread"),
    conservation("⭐", 4, "row", "circle"),
    conservation("🐟", 5, "compact", "spread"),
  ]);

  await lesson(u4.id, { slug: "donde-hay-mas", title: "¿Dónde hay más?", order: 4, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "⚖️", repeat: 1, text: "Primero vemos más e igual. Después vemos menos." }], { emoji: "🍎", count: 2, text: "Mira los dos grupos.", successText: "¡Comparaste!" }),
    compareGroups({ item: "🍎", count: 3 }, { item: "🍎", count: 5 }),
    compareGroups({ item: "⭐", count: 4 }, { item: "⭐", count: 4 }),
    compareGroups({ item: "🐟", count: 6 }, { item: "🐟", count: 2 }),
    compareGroups({ item: "🍓", count: 5 }, { item: "🍓", count: 7 }),
  ]);

  await lesson(u4.id, { slug: "maquina-de-partes", title: "La máquina de partes", order: 5, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "⚙️", repeat: 1, text: "Un grupo puede separarse en partes." }], { emoji: "⭐", count: 4, text: "Toca el grupo completo.", successText: "¡Ahora sepáralo!" }),
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
    lumi([{ emoji: "🧺", repeat: 1, text: "Para sumar, juntamos grupos y contamos todo." }], { emoji: "🍓", count: 5, text: "Toca todas las fresas juntas.", successText: "¡Todo junto!" }),
    add(1, 1, "🍎"),
    add(2, 1, "⭐"),
    add(2, 2, "🐟"),
  ]);

  await lesson(u5.id, { slug: "sumar-hasta-5", title: "Sumar hasta 5", order: 2, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "🍓", repeat: 5, text: "Junta grupos pequeños y cuenta el total." }], { emoji: "🍓", count: 5, text: "Toca cinco fresas.", successText: "¡Cinco!" }),
    add(2, 3, "🍓"),
    add(1, 4, "🍎"),
    add(3, 2, "⭐"),
  ]);

  await lesson(u5.id, { slug: "sumar-hasta-10", title: "Sumar hasta 10", order: 3, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🐟", repeat: 7, text: "Con grupos más grandes hacemos lo mismo: juntamos y contamos." }], { emoji: "🐟", count: 7, text: "Toca siete peces.", successText: "¡Siete!" }),
    add(3, 3, "⭐"),
    add(4, 3, "🐟"),
    add(5, 5, "🍎"),
  ]);

  await lesson(u5.id, { slug: "repaso-sumas", title: "Repaso de sumas", order: 4, xpReward: 34, minutes: 8 }, [
    lumi([{ emoji: "🧺", repeat: 1, text: "Repasamos: juntar dos grupos nos da un total." }], { emoji: "🍎", count: 4, text: "Toca el grupo junto.", successText: "¡Listo!" }),
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

  await lesson(u6.id, { slug: "sacar-cosas", title: "Saca y cuenta", order: 1, xpReward: 30, minutes: 7 }, [
    lumi([{ emoji: "✋", repeat: 1, text: "Restar empieza con sacar cosas de un grupo." }], { emoji: "🧁", count: 3, text: "Toca los que quedaron.", successText: "¡Quedaron!" }),
    sub(3, 1, "🍎"),
    sub(4, 2, "⭐"),
    sub(5, 2, "🐟"),
  ]);

  await lesson(u6.id, { slug: "restar-hasta-10", title: "Restar hasta 10", order: 2, xpReward: 32, minutes: 8 }, [
    lumi([{ emoji: "🐟", repeat: 8, text: "Si se van algunos, contamos los que quedan." }], { emoji: "🐟", count: 5, text: "Toca cinco peces que quedan.", successText: "¡Cinco quedaron!" }),
    sub(6, 2, "🍎"),
    sub(8, 3, "⭐"),
    sub(10, 4, "🐟"),
  ]);

  await lesson(u6.id, { slug: "repaso-restas", title: "Repaso de restas", order: 3, xpReward: 36, minutes: 8 }, [
    lumi([{ emoji: "➖", repeat: 1, text: "Repasamos sacar y contar lo que queda." }], { emoji: "🧁", count: 5, text: "Toca los cupcakes.", successText: "¡A sacar!" }),
    sub(4, 1, "🍎"),
    sub(7, 3, "⭐"),
    sub(9, 4, "🐟"),
    sub(10, 5, "🧁"),
  ]);

  // ============================================================
  // MATH · Trazos de números (opcional, grafomotricidad 0-9)
  // ============================================================
  const numberTracing = await prisma.learningPath.create({
    data: {
      subjectId: mathSubject.id,
      slug: "math-number-tracing",
      name: "Trazos de números",
      description: "Practica escribir los números del 0 al 9 con el dedo.",
      level: EducationLevel.INITIAL,
      difficulty: 1,
      isPremium: false,
      order: 2,
    },
  });

  const tu0 = await prisma.unit.create({
    data: {
      learningPathId: numberTracing.id,
      slug: "conocer-el-cero",
      title: "Conocer el 0",
      description: "Descubrir que cero significa que no hay nada y practicar su trazo redondo.",
      order: 1,
      color: "mint",
      icon: "0️⃣",
    },
  });
  await traceDigitLesson(tu0.id, 0, 1);

  const tu1 = await prisma.unit.create({
    data: {
      learningPathId: numberTracing.id,
      slug: "trazos-1-3",
      title: "Trazar 1, 2 y 3",
      description: "Números pequeños con líneas y curvas simples.",
      order: 2,
      color: "sky",
      icon: "✏️",
    },
  });
  await traceDigitLesson(tu1.id, 1, 1);
  await traceDigitLesson(tu1.id, 2, 2);
  await traceDigitLesson(tu1.id, 3, 3);

  const tu2 = await prisma.unit.create({
    data: {
      learningPathId: numberTracing.id,
      slug: "trazos-4-5",
      title: "Trazar 4 y 5",
      description: "Practicar cambios de dirección y curvas cortas.",
      order: 3,
      color: "sun",
      icon: "4️⃣",
    },
  });
  await traceDigitLesson(tu2.id, 4, 1);
  await traceDigitLesson(tu2.id, 5, 2);

  const tu3 = await prisma.unit.create({
    data: {
      learningPathId: numberTracing.id,
      slug: "trazos-6-7",
      title: "Trazar 6 y 7",
      description: "Unir curvas y líneas largas con control del dedo.",
      order: 4,
      color: "peach",
      icon: "6️⃣",
    },
  });
  await traceDigitLesson(tu3.id, 6, 1);
  await traceDigitLesson(tu3.id, 7, 2);

  const tu4 = await prisma.unit.create({
    data: {
      learningPathId: numberTracing.id,
      slug: "trazos-8-9",
      title: "Trazar 8 y 9",
      description: "Números con curvas más retadoras para practicar despacio.",
      order: 5,
      color: "lilac",
      icon: "8️⃣",
    },
  });
  await traceDigitLesson(tu4.id, 8, 1);
  await traceDigitLesson(tu4.id, 9, 2);

  // ============================================================
  // MATH · 1.º grado · Matemática con Paskalito
  // ============================================================
  await seedPrimaryOnePath(mathSubject.id);

  // ============================================================
  // READING · Inicial (premium en dev para validar el bloqueo de paths)
  // ============================================================
  const readingInitial = await prisma.learningPath.create({
    data: {
      subjectId: readingSubject.id,
      slug: "reading-initial",
      name: "Lectura inicial",
      description: "Letras, sonidos y primeras palabras.",
      level: EducationLevel.INITIAL,
      difficulty: 1,
      isPremium: true,
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
        hints: ["Di la palabra: SSSSol.", "El sonido es como una serpiente."],
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
        hints: ["Cuenta las cajitas.", "S - O - L."],
        explanation: "SOL tiene 3 letras: S, O, L.",
        difficulty: 1, xpReward: 5,
      },
      {
        lessonId: rl2.id, kind: ExerciseKind.MULTIPLE_CHOICE, order: 2,
        prompt: "¿Cuántas letras tiene la palabra?",
        payload: { visual: "word-letters", word: "CASA" },
        solution: { answer: 4 },
        hints: ["Cuenta una por una.", "C - A - S - A."],
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
      description: "Identifica palabras simples y sus imágenes",
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
        payload: { visual: "emoji-word", emoji: "🍎", options: ["pera", "manzana", "uva", "plátano"] },
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
      { slug: "first-lesson", name: "Primera lección", description: "Completa 1 lección", icon: "🌟", target: 1, metric: "lessons_completed" },
      { slug: "streak-3", name: "3 días seguidos", description: "Mantén racha", icon: "🔥", target: 3, metric: "streak" },
      { slug: "correct-100", name: "100 aciertos", description: "Suma 100 correctas", icon: "💯", target: 100, metric: "correct_answers" },
      { slug: "lessons-5", name: "5 lecciones", description: "Completa 5 lecciones", icon: "📚", target: 5, metric: "lessons_completed" },
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
