// app/api/children/route.ts
// GET /api/children — listar hijos del user logueado
// POST /api/children — crear un nuevo perfil de niño y setearlo como activo
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const children = await prisma.child.findMany({
    where: { parentId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ children });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { name, age, avatar } = await req.json();
  if (!name || !age) {
    return NextResponse.json({ error: "name & age required" }, { status: 400 });
  }

  const child = await prisma.child.create({
    data: {
      parentId: user.id,
      name,
      age: Number(age),
      avatar: avatar ?? "🦁",
    },
  });

  // Marcar al recién creado como activo
  const c = await cookies();
  c.set(ACTIVE_CHILD_COOKIE, child.id, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ child });
}
