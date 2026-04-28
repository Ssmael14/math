// app/api/attempts/route.ts
// POST /api/attempts — registrar cada intento individual.
//
// Si el intento es el "final" del ejercicio (`final: true`), también
// actualizamos la Mastery vía SM-2. Esto deja todos los intentos en analytics
// pero sólo cierra una review de SRS por ejercicio resuelto.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  applyReview,
  gradeQuality,
  INITIAL_SRS,
  nextReviewDate,
} from "@/lib/srs";

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

  // Inputs opcionales para SRS (vienen sólo en el intento "final").
  const final = body.final === true;
  const priorWrongs = Number.isInteger(body.priorWrongs) ? Math.max(0, body.priorWrongs as number) : 0;
  const solutionShown = body.solutionShown === true;

  // En modo Repaso del día NO descontamos corazones — la idea es que el niño
  // se sienta seguro repasando lo que ya vio, sin penalizarlo.
  const reviewMode = body.reviewMode === true;

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) return NextResponse.json({ error: "exercise_not_found" }, { status: 404 });

  const attempt = await prisma.attempt.create({
    data: { childId, exerciseId, correct, response: body.response ?? {}, timeMs },
  });

  if (!correct && !reviewMode && child.hearts > 0) {
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

    const prevState = existing
      ? {
          easeFactor: existing.easeFactor,
          interval: existing.interval,
          repetitions: existing.repetitions,
          masteryLevel: existing.masteryLevel,
        }
      : INITIAL_SRS;

    const nextState = applyReview(prevState, quality);
    const now = new Date();
    const nextAt = nextReviewDate(nextState, now);

    mastery = await prisma.mastery.upsert({
      where: { childId_exerciseId: { childId, exerciseId } },
      update: {
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        masteryLevel: nextState.masteryLevel,
        nextReviewAt: nextAt,
        lastSeenAt: now,
      },
      create: {
        childId,
        exerciseId,
        easeFactor: nextState.easeFactor,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        masteryLevel: nextState.masteryLevel,
        nextReviewAt: nextAt,
        lastSeenAt: now,
      },
    });
  }

  return NextResponse.json({ attempt, mastery });
}
