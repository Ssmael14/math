// app/api/enrollments/route.ts
// POST /api/enrollments — inscribe a un child en un LearningPath.
//
// Body: { childId, learningPathSlug }
// Comportamiento:
//   - Idempotente: si el child ya está enrolled, devuelve el enrollment
//     existente (no falla con 409).
//   - Setea la cookie `lm_path` con el slug del path, así el flow
//     siguiente (/home) muestra el path correcto sin parámetros extra.
//   - Premium: si el path es premium y el user.plan === FREE, devolvemos
//     402 (Payment Required) — Fase 5 va a manejar el upgrade real.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_PATH_COOKIE } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const limited = rateLimit(`enrollments:${user.id}`, 30, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const childId = typeof body.childId === "string" ? body.childId : null;
  const learningPathSlug = typeof body.learningPathSlug === "string" ? body.learningPathSlug : null;
  if (!childId || !learningPathSlug) {
    return NextResponse.json({ error: "childId & learningPathSlug required" }, { status: 400 });
  }

  // El child tiene que pertenecer al user logueado.
  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const path = await prisma.learningPath.findUnique({
    where: { slug: learningPathSlug },
    include: { subject: true },
  });
  if (!path) return NextResponse.json({ error: "path_not_found" }, { status: 404 });

  if (path.isPremium && user.plan === "FREE") {
    return NextResponse.json({ error: "premium_required", subject: path.subject.slug }, { status: 402 });
  }

  // Idempotente: upsert sobre el unique [childId, learningPathId].
  const enrollment = await prisma.enrollment.upsert({
    where: { childId_learningPathId: { childId, learningPathId: path.id } },
    update: {}, // ya existe, no tocamos campos
    create: { childId, learningPathId: path.id },
  });

  // Setear el path activo para el flow siguiente.
  const c = await cookies();
  c.set(ACTIVE_PATH_COOKIE, path.slug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ enrollment, path });
}
