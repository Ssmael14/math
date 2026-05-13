// lib/queries.ts
// Queries de alto nivel — envolturas tipadas sobre Prisma.
// Las pantallas usan esto en lugar de prisma directamente.
//
// Nota: las páginas nuevas consumen Subject -> LearningPath -> Unit -> Lesson.
// Los helpers de compatibilidad siguen existiendo para redirects y pantallas
// legacy, pero ya no deben usarse para presentar contenido huérfano.

import { prisma } from "./prisma";
import {
  getCurrentUser,
  getActiveChildId,
  getActivePathSlug,
} from "./auth/server";
import { MASTERY_THRESHOLD } from "./learning/srs";

// =========================================================================
// SUBJECTS / LEARNING PATHS / ENROLLMENTS
// =========================================================================

/** Todas las materias en orden (incluye placeholders coming-soon). */
export async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { learningPaths: true } },
    },
  });
}

/** Subject por slug con sus LearningPaths. null si no existe. */
export async function getSubjectBySlug(subjectSlug: string) {
  return prisma.subject.findUnique({
    where: { slug: subjectSlug },
    include: {
      learningPaths: { orderBy: { order: "asc" } },
    },
  });
}

/** LearningPaths de un subject (por slug). null si no existe. */
export async function getLearningPathsBySubject(subjectSlug: string) {
  return prisma.subject.findUnique({
    where: { slug: subjectSlug },
    include: {
      learningPaths: { orderBy: { order: "asc" } },
    },
  });
}

/** LearningPath por slug + su subject. null si no existe. */
export async function getLearningPathBySlug(slug: string) {
  return prisma.learningPath.findUnique({
    where: { slug },
    include: { subject: true },
  });
}

/** LearningPath por slug con subject y units ordenadas. */
export async function getLearningPathWithUnitsBySlug(slug: string) {
  return prisma.learningPath.findUnique({
    where: { slug },
    include: {
      subject: true,
      units: { orderBy: { order: "asc" } },
    },
  });
}

/** Enrollments del child con su path + subject incluidos. */
export async function getEnrollments(childId: string) {
  return prisma.enrollment.findMany({
    where: { childId },
    orderBy: { startedAt: "desc" },
    include: {
      learningPath: { include: { subject: true } },
    },
  });
}

/**
 * Elige el LearningPath "activo" para una página agnóstica de path:
 *  1. Si hay cookie `lm_path` y el child está enrolled ahí, ese.
 *  2. Sino, el enrollment más reciente del child.
 *  3. Sino, null (caller debe redirigir a /subjects).
 */
export async function getActiveEnrollment(childId: string) {
  const activeSlug = await getActivePathSlug();
  const enrollments = await getEnrollments(childId);
  if (enrollments.length === 0) return null;
  if (activeSlug) {
    const match = enrollments.find((e) => e.learningPath.slug === activeSlug);
    if (match) return match;
  }
  return enrollments[0];
}

/** Devuelve el child activo del user (cookie o primero). */
export async function getActiveChild() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (user.children.length === 0) return null;
  const id = await getActiveChildId();
  if (id) {
    const found = user.children.find((c) => c.id === id);
    if (found) return found;
  }
  return user.children[0];
}

/**
 * Devuelve el primer LearningPath activo (por orden). Mientras no haya
 * Enrollments cableados, todas las pantallas trabajan contra este.
 */
export async function getDefaultLearningPath() {
  return prisma.learningPath.findFirst({
    orderBy: { order: "asc" },
    include: { subject: true },
  });
}

/** Unit por slug global con learningPath + subject para breadcrumbs. */
export async function getUnitBySlug(slug: string) {
  return prisma.unit.findFirst({
    where: { slug },
    include: {
      learningPath: {
        include: { subject: true },
      },
    },
  });
}

/** Lesson por id con su Unit, LearningPath y Subject. */
export async function getLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      unit: {
        include: {
          learningPath: {
            include: { subject: true },
          },
        },
      },
    },
  });
}

/** Todas las unidades de un learning path, con progreso del child. */
export async function getUnitsWithProgress(
  childId: string,
  learningPathId: string,
) {
  const units = await prisma.unit.findMany({
    where: { learningPathId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progresses: { where: { childId } } },
      },
    },
  });

  return units.map((u) => {
    const total = u.lessons.length;
    const done = u.lessons.filter((l) => l.progresses[0]?.completed).length;
    return {
      id: u.id,
      slug: u.slug,
      title: u.title,
      description: u.description,
      color: u.color,
      icon: u.icon,
      progress: total ? done / total : 0,
      lessonsTotal: total,
      lessonsDone: done,
    };
  });
}

/** Lecciones de una unidad (unique por [learningPathId, slug]). */
export async function getLessonsWithState(
  learningPathId: string,
  unitSlug: string,
  childId: string,
) {
  const unit = await prisma.unit.findUnique({
    where: { learningPathId_slug: { learningPathId, slug: unitSlug } },
    include: {
      learningPath: {
        include: { subject: true },
      },
      lessons: {
        orderBy: { order: "asc" },
        include: { progresses: { where: { childId } } },
      },
    },
  });
  if (!unit) return null;

  let hitCurrent = false;
  const lessons = unit.lessons.map((l) => {
    const done = l.progresses[0]?.completed ?? false;
    let status: "done" | "current" | "locked" = "locked";
    if (done) status = "done";
    else if (!hitCurrent) {
      status = "current";
      hitCurrent = true;
    }
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      order: l.order,
      xpReward: l.xpReward,
      stars: l.progresses[0]?.stars ?? 0,
      status,
    };
  });

  return { unit, lessons };
}

/** Ejercicios de una lección. */
export async function getLessonExercises(lessonId: string) {
  return prisma.exercise.findMany({
    where: { lessonId },
    orderBy: { order: "asc" },
  });
}

// =========================================================================
// SHOP
// =========================================================================
export async function getShopWithOwnership(childId: string) {
  const [items, owned] = await Promise.all([
    prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    prisma.inventory.findMany({ where: { childId } }),
  ]);
  const ownedIds = new Set(owned.map((o) => o.itemId));
  const equippedIds = new Set(
    owned.filter((o) => o.equipped).map((o) => o.itemId),
  );
  return items.map((it) => ({
    ...it,
    owned: ownedIds.has(it.id),
    equipped: equippedIds.has(it.id),
  }));
}

// =========================================================================
// ACHIEVEMENTS
// =========================================================================
export async function getAchievementsWithProgress(childId: string) {
  const [defs, unlocked, child, lessonsDone, correct] = await Promise.all([
    prisma.achievement.findMany({ orderBy: { target: "asc" } }),
    prisma.childAchievement.findMany({ where: { childId } }),
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.progress.count({ where: { childId, completed: true } }),
    prisma.attempt.count({ where: { childId, correct: true } }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));

  return defs.map((a) => {
    let current = 0;
    if (a.metric === "lessons_completed") current = lessonsDone;
    else if (a.metric === "correct_answers") current = correct;
    else if (a.metric === "streak") current = child?.streak ?? 0;
    return {
      ...a,
      current,
      unlocked: unlockedIds.has(a.id) || current >= a.target,
    };
  });
}

// =========================================================================
// LEAGUE / LEADERBOARD semanal
// =========================================================================
function mondayOfWeek(d = new Date()) {
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const m = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  m.setUTCDate(m.getUTCDate() + diff);
  return m;
}

export async function getLeaderboard(childId: string, league = "DIAMOND") {
  const weekStart = mondayOfWeek();
  const rows = await prisma.weeklyXP.findMany({
    where: { weekStart, league },
    include: { child: true },
    orderBy: { xp: "desc" },
    take: 30,
  });
  const ranked = rows.map((r, i) => ({
    rank: i + 1,
    name: r.child.name,
    avatar: r.child.avatar,
    xp: r.xp,
    isMe: r.childId === childId,
  }));
  const me = ranked.find((r) => r.isMe);
  return { weekStart, league, rows: ranked, myRank: me?.rank ?? null };
}

// =========================================================================
// MASTERY · stats agregadas para perfil/home
// =========================================================================
export async function getMasteryStats(childId: string) {
  const now = new Date();
  const [mastered, learning, dueToday] = await Promise.all([
    prisma.mastery.count({
      where: { childId, masteryLevel: { gte: MASTERY_THRESHOLD } },
    }),
    prisma.mastery.count({
      where: { childId, masteryLevel: { lt: MASTERY_THRESHOLD, gt: 0 } },
    }),
    prisma.mastery.count({
      where: {
        childId,
        nextReviewAt: { lte: now },
        masteryLevel: { lt: MASTERY_THRESHOLD },
      },
    }),
  ]);
  return { mastered, learning, dueToday };
}

/** Próximos N ejercicios cuya review está vencida (nextReviewAt <= ahora). */
export async function getReviewQueue(childId: string, limit = 10) {
  const now = new Date();
  return prisma.mastery.findMany({
    where: { childId, nextReviewAt: { lte: now } },
    orderBy: { nextReviewAt: "asc" },
    take: limit,
    include: { exercise: true },
  });
}
