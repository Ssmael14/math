// lib/queries.ts
// Queries de alto nivel — envolturas tipadas sobre Prisma.
// Las pantallas usan esto en lugar de prisma directamente.

import { prisma } from "./prisma";
import { getCurrentUser, getActiveChildId } from "./auth";

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

/** Todas las unidades con progreso calculado para un child. */
export async function getUnitsWithProgress(childId: string) {
  const units = await prisma.unit.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          progress: { where: { childId } },
        },
      },
    },
  });

  return units.map((u) => {
    const total = u.lessons.length;
    const done = u.lessons.filter((l) => l.progress[0]?.completed).length;
    return {
      id: u.id,
      slug: u.slug,
      title: u.title,
      description: u.description,
      color: u.color,
      icon: u.icon,
      isPremium: u.isPremium,
      progress: total ? done / total : 0,
      lessonsTotal: total,
      lessonsDone: done,
    };
  });
}

/** Lecciones de una unidad, con flag de estado (done/current/locked). */
export async function getLessonsWithState(unitSlug: string, childId: string) {
  const unit = await prisma.unit.findUnique({
    where: { slug: unitSlug },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progress: { where: { childId } } },
      },
    },
  });
  if (!unit) return null;

  let hitCurrent = false;
  const lessons = unit.lessons.map((l) => {
    const done = l.progress[0]?.completed ?? false;
    let status: "done" | "current" | "locked" = "locked";
    if (done) status = "done";
    else if (!hitCurrent) { status = "current"; hitCurrent = true; }
    return {
      id: l.id,
      slug: l.slug,
      title: l.title,
      order: l.order,
      xpReward: l.xpReward,
      stars: l.progress[0]?.stars ?? 0,
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
    prisma.shopItem.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
    prisma.inventory.findMany({ where: { childId } }),
  ]);
  const ownedIds = new Set(owned.map((o) => o.itemId));
  const equippedIds = new Set(owned.filter((o) => o.equipped).map((o) => o.itemId));
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
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
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
