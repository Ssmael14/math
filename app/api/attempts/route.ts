// app/api/attempts/route.ts
// POST /api/attempts — registra cada intento individual.
//
// Si el intento es el "final" del ejercicio (final: true), actualizamos
// también la Mastery (SRS simplificado en lib/srs.ts).
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { verifyLessonAccess } from "@/lib/learning/lesson-access";
import { rateLimit } from "@/lib/rate-limit";
import { applyReview, gradeQuality, INITIAL_SRS, nextReviewDate } from "@/lib/learning/srs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const limited = rateLimit(`attempts:${user.id}`, 120, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const childId = typeof body.childId === "string" ? body.childId : null;
  const exerciseId = typeof body.exerciseId === "string" ? body.exerciseId : null;
  const correct = typeof body.correct === "boolean" ? body.correct : null;
  const timeMs = Number.isFinite(body.timeMs) ? Math.max(0, Math.min(600_000, Math.floor(body.timeMs))) : null;

  if (!childId || !exerciseId || correct === null || timeMs === null) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const final = body.final === true;
  const priorWrongs = Number.isInteger(body.priorWrongs) ? Math.max(0, body.priorWrongs as number) : 0;
  const solutionShown = body.solutionShown === true;
  const hintsUsed = Number.isInteger(body.hintsUsed) ? Math.max(0, body.hintsUsed as number) : 0;
  const reviewMode = body.reviewMode === true;

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true, lessonId: true },
  });
  if (!exercise) return NextResponse.json({ error: "exercise_not_found" }, { status: 404 });

  const access = await verifyLessonAccess(childId, exercise.lessonId);
  if (!access.ok) {
    const status =
      access.reason === "lesson_not_found"
        ? 404
        : access.reason === "locked"
          ? 409
          : 403;
    return NextResponse.json({ error: access.reason }, { status });
  }

  const attempt = await prisma.attempt.create({
    data: { childId, exerciseId, correct, response: body.response ?? {}, timeMs, hintsUsed },
  });

  // Sólo descontamos un corazón cuando el ejercicio se cierra mal (final + wrong
  // + no review). Los wrong intermedios sólo van a analytics.
  if (!correct && final && !reviewMode && child.hearts > 0) {
    await prisma.child.update({
      where: { id: childId },
      data: { hearts: { decrement: 1 } },
    });
  }

  let mastery = null;
  if (final) {
    const quality = gradeQuality({ correct, priorWrongs, solutionShown });

    const existing = await prisma.mastery.findUnique({
      where: { childId_exerciseId: { childId, exerciseId } },
    });

    const prev = existing
      ? { repetitions: existing.repetitions, masteryLevel: existing.masteryLevel }
      : INITIAL_SRS;

    const { state, intervalDays } = applyReview(prev, quality);
    const now = new Date();
    const nextAt = nextReviewDate(intervalDays, now);

    mastery = await prisma.mastery.upsert({
      where: { childId_exerciseId: { childId, exerciseId } },
      update: {
        repetitions: state.repetitions,
        masteryLevel: state.masteryLevel,
        nextReviewAt: nextAt,
      },
      create: {
        childId,
        exerciseId,
        repetitions: state.repetitions,
        masteryLevel: state.masteryLevel,
        nextReviewAt: nextAt,
      },
    });
  }

  return NextResponse.json({ attempt, mastery });
}
