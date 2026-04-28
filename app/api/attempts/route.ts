// app/api/attempts/route.ts
// POST /api/attempts — registrar cada intento individual (para analytics)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // 120 intentos/min por usuario: cubre uso humano normal (un ejercicio cada
  // ~0.5s mantenido por un minuto entero) y corta scripts.
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

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  // Validar que el ejercicio existe (no aceptar ids inventados)
  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } });
  if (!exercise) return NextResponse.json({ error: "exercise_not_found" }, { status: 404 });

  const attempt = await prisma.attempt.create({
    data: { childId, exerciseId, correct, response: body.response ?? {}, timeMs },
  });

  if (!correct && child.hearts > 0) {
    await prisma.child.update({
      where: { id: childId },
      data: { hearts: { decrement: 1 } },
    });
  }

  return NextResponse.json({ attempt });
}
