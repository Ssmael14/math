// app/api/attempts/route.ts
// POST /api/attempts — registrar cada intento individual (para analytics)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { childId, exerciseId, correct, response, timeMs } = await req.json();

  const child = await prisma.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const attempt = await prisma.attempt.create({
    data: { childId, exerciseId, correct, response, timeMs },
  });

  // Si fue incorrecto, restá un corazón
  if (!correct) {
    await prisma.child.update({
      where: { id: childId },
      data: { hearts: { decrement: 1 } },
    });
  }

  return NextResponse.json({ attempt });
}
