// app/api/children/[id]/route.ts — editar/borrar perfil
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE, getActiveChildId } from "@/lib/auth/server";
import {
  birthDateFromAge,
  normalizeChildAvatar,
  normalizeChildName,
} from "@/lib/children";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

async function ownChild(userId: string, id: string) {
  return prisma.child.findFirst({ where: { id, parentId: userId } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const limited = rateLimit(`children:edit:${user.id}`, 30, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { id } = await params;
  if (!(await ownChild(user.id, id))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if ("name" in body) {
    const name = normalizeChildName(body.name);
    if (!name) return NextResponse.json({ error: "invalid_name" }, { status: 400 });
    data.name = name;
  }
  if ("age" in body) {
    const birthDate = birthDateFromAge(body.age);
    if (!birthDate) return NextResponse.json({ error: "invalid_age" }, { status: 400 });
    data.birthDate = birthDate;
  }
  if ("avatar" in body) {
    data.avatar = normalizeChildAvatar(body.avatar);
  }

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
