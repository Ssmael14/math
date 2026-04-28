// app/api/progress/route.ts
// POST /api/progress — el niño completó una lección.
// El servidor calcula estrellas, XP y streak — el cliente NO los manda.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStars, mondayOfWeek } from "@/lib/scoring";
import { computeNextStreak } from "@/lib/streak";
import { rateLimit } from "@/lib/rate-limit";

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

  // Máx 30 lecciones completadas por minuto por usuario — más que suficiente
  // para uso humano normal, corta abuso obvio.
  const limited = rateLimit(`progress:${user.id}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const childId = typeof body.childId === "string" ? body.childId : null;
  const lessonId = typeof body.lessonId === "string" ? body.lessonId : null;
  const correctCount = Number.isInteger(body.correctCount) ? (body.correctCount as number) : null;

  if (!childId || !lessonId || correctCount === null || correctCount < 0) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { _count: { select: { exercises: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "lesson not found" }, { status: 404 });

  const totalExercises = lesson._count.exercises;
  if (totalExercises === 0) {
    return NextResponse.json({ error: "lesson_empty" }, { status: 400 });
  }

  // El servidor calcula. El cliente sólo informa cuántas acertó.
  const safeCorrect = Math.min(Math.max(0, correctCount), totalExercises);
  const stars = computeStars(safeCorrect, totalExercises);

  const now = new Date();
  const nextStreak = computeNextStreak(child.streak, child.lastPlay, now);
  const weekStart = mondayOfWeek(now);

  // Si ya existía progreso, no bajamos estrellas ni bestScore por un repaso peor.
  const existing = await prisma.progress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  });
  const finalStars = Math.max(existing?.stars ?? 0, stars);
  const finalBestScore = Math.max(existing?.bestScore ?? 0, safeCorrect);

  await prisma.$transaction([
    prisma.progress.upsert({
      where: { childId_lessonId: { childId, lessonId } },
      update: {
        completed: true,
        stars: finalStars,
        bestScore: finalBestScore,
        completedAt: now,
      },
      create: {
        childId,
        lessonId,
        completed: true,
        stars: finalStars,
        bestScore: finalBestScore,
        completedAt: now,
      },
    }),
    prisma.child.update({
      where: { id: childId },
      data: {
        xp: { increment: lesson.xpReward },
        lastPlay: now,
        streak: nextStreak,
      },
    }),
    prisma.weeklyXP.upsert({
      where: { childId_weekStart: { childId, weekStart } },
      update: { xp: { increment: lesson.xpReward } },
      create: { childId, weekStart, xp: lesson.xpReward, league: "DIAMOND" },
    }),
  ]);

  const newAchievements = await checkAchievements(childId);

  return NextResponse.json({
    stars,
    xp: lesson.xpReward,
    correct: safeCorrect,
    total: totalExercises,
    streak: nextStreak,
    newAchievements,
  });
}
