// app/api/children/[id]/route.ts — editar/borrar perfil
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE, getActiveChildId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function ownChild(userId: string, id: string) {
  return prisma.child.findFirst({ where: { id, parentId: userId } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await ownChild(user.id, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.age === "number") data.age = body.age;
  if (typeof body.avatar === "string") data.avatar = body.avatar;

  const child = await prisma.child.update({ where: { id }, data });
  return NextResponse.json({ child });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await ownChild(user.id, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await prisma.child.delete({ where: { id } });

  // Si era el activo, limpiar cookie
  const activeId = await getActiveChildId();
  if (activeId === id) {
    const c = await cookies();
    c.delete(ACTIVE_CHILD_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
