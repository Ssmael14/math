// app/api/progress/route.ts
// POST /api/progress — el niño completó una lección.
// El servidor calcula estrellas, XP y streak — el cliente NO los manda.
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { computeStars, mondayOfWeek } from "@/lib/gamification/scoring";
import { computeNextStreak } from "@/lib/gamification/streak";
import { verifyLessonAccess } from "@/lib/learning/lesson-access";
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

  const access = await verifyLessonAccess(childId, lessonId);
  if (!access.ok) {
    const status =
      access.reason === "lesson_not_found"
        ? 404
        : access.reason === "locked"
          ? 409
          : 403;
    return NextResponse.json({ error: access.reason }, { status });
  }
  const { lesson } = access;

  // Los pasos TEACH (enseñanza) no se califican: no cuentan para estrellas.
  const totalExercises = await prisma.exercise.count({
    where: { lessonId, kind: { not: "TEACH" } },
  });
  if (totalExercises === 0) {
    return NextResponse.json({ error: "lesson_empty" }, { status: 400 });
  }

  // El servidor calcula. El cliente sólo informa cuántas acertó.
  const safeCorrect = Math.min(Math.max(0, correctCount), totalExercises);
  const stars = computeStars(safeCorrect, totalExercises);

  const now = new Date();
  const nextStreak = computeNextStreak(child.streak, child.lastPlayAt, now);
  const weekStart = mondayOfWeek(now);
  let firstCompletion = false;

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.progress.findUnique({
        where: { childId_lessonId: { childId, lessonId } },
      });
      const finalStars = Math.max(current?.stars ?? 0, stars);
      const finalBestScore = Math.max(current?.bestScore ?? 0, safeCorrect);

      if (current?.completed) {
        await tx.progress.update({
          where: { id: current.id },
          data: {
            stars: finalStars,
            bestScore: finalBestScore,
            attemptsCount: { increment: 1 },
            completedAt: current.completedAt ?? now,
          },
        });
        return;
      }

      if (current) {
        const claimed = await tx.progress.updateMany({
          where: { id: current.id, completed: false },
          data: {
            completed: true,
            stars: finalStars,
            bestScore: finalBestScore,
            attemptsCount: { increment: 1 },
            completedAt: now,
          },
        });
        firstCompletion = claimed.count === 1;

        if (!firstCompletion) {
          await tx.progress.update({
            where: { id: current.id },
            data: {
              stars: finalStars,
              bestScore: finalBestScore,
              attemptsCount: { increment: 1 },
            },
          });
        }
      } else {
        await tx.progress.create({
          data: {
            childId,
            lessonId,
            completed: true,
            stars,
            bestScore: safeCorrect,
            attemptsCount: 1,
            completedAt: now,
          },
        });
        firstCompletion = true;
      }

      if (firstCompletion) {
        await tx.child.update({
          where: { id: childId },
          data: {
            xp: { increment: lesson.xpReward },
            lastPlayAt: now,
            streak: nextStreak,
          },
        });
        await tx.weeklyXP.upsert({
          where: { childId_weekStart: { childId, weekStart } },
          update: { xp: { increment: lesson.xpReward } },
          create: { childId, weekStart, xp: lesson.xpReward, league: "DIAMOND" },
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const current = await prisma.progress.findUnique({
        where: { childId_lessonId: { childId, lessonId } },
      });
      if (!current) throw error;

      await prisma.progress.update({
        where: { id: current.id },
        data: {
          completed: true,
          stars: Math.max(current.stars, stars),
          bestScore: Math.max(current.bestScore, safeCorrect),
          attemptsCount: { increment: 1 },
          completedAt: current.completedAt ?? now,
        },
      });
      firstCompletion = false;
    } else {
      throw error;
    }
  }

  const newAchievements = firstCompletion ? await checkAchievements(childId) : [];

  revalidatePath("/home");
  revalidatePath("/profile");
  revalidatePath("/achievements");
  revalidatePath(`/units/${lesson.unit.slug}`);
  revalidatePath(`/paths/${lesson.unit.learningPath.slug}`);

  return NextResponse.json({
    stars,
    xp: firstCompletion ? lesson.xpReward : 0,
    correct: safeCorrect,
    total: totalExercises,
    streak: firstCompletion ? nextStreak : child.streak,
    firstCompletion,
    newAchievements,
  });
}
