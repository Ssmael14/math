// app/api/progress/route.ts
// POST /api/progress — el niño completó una lección.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function mondayOfWeek(d = new Date()) {
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  m.setUTCDate(m.getUTCDate() + diff);
  return m;
}

async function checkAchievements(childId: string) {
  const [child, lessonsDone, correct, defs, already] = await Promise.all([
    prisma.child.findUnique({ where: { id: childId } }),
    prisma.progress.count({ where: { childId, completed: true } }),
    prisma.attempt.count({ where: { childId, correct: true } }),
    prisma.achievement.findMany(),
    prisma.childAchievement.findMany({ where: { childId } }),
  ]);
  const have = new Set(already.map((a) => a.achievementId));
  const toUnlock: string[] = [];
  for (const a of defs) {
    if (have.has(a.id)) continue;
    let cur = 0;
    if (a.metric === "lessons_completed") cur = lessonsDone;
    else if (a.metric === "correct_answers") cur = correct;
    else if (a.metric === "streak") cur = child?.streak ?? 0;
    if (cur >= a.target) toUnlock.push(a.id);
  }
  if (toUnlock.length) {
    await prisma.childAchievement.createMany({
      data: toUnlock.map((achievementId) => ({ childId, achievementId })),
      skipDuplicates: true,
    });
  }
  return toUnlock;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { childId, lessonId, stars, score } = await req.json();

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 });

  const progress = await prisma.progress.upsert({
    where: { childId_lessonId: { childId, lessonId } },
    update: {
      completed: true,
      stars: Math.max(stars, 0),
      bestScore: Math.max(score ?? 0, 0),
      completedAt: new Date(),
    },
    create: {
      childId, lessonId,
      completed: true,
      stars: Math.max(stars, 0),
      bestScore: score ?? 0,
      completedAt: new Date(),
    },
  });

  // Sumar XP al niño + lastPlay
  await prisma.child.update({
    where: { id: childId },
    data: {
      xp: { increment: lesson.xpReward },
      lastPlay: new Date(),
    },
  });

  // Sumar XP semanal (alimenta la liga)
  const weekStart = mondayOfWeek();
  await prisma.weeklyXP.upsert({
    where: { childId_weekStart: { childId, weekStart } },
    update: { xp: { increment: lesson.xpReward } },
    create: { childId, weekStart, xp: lesson.xpReward, league: "DIAMOND" },
  });

  // Desbloquear achievements alcanzados
  const newAchievements = await checkAchievements(childId);

  return NextResponse.json({ progress, newAchievements });
}
