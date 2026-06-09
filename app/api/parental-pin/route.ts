// app/api/parental-pin/route.ts
// POST: setear/cambiar PIN (4 dígitos)
// PUT:  verificar PIN — settea cookie de sesión parental por 30min
// DELETE: cerrar sesión parental
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
// Next 15 no permite re-exportar constantes desde un route.ts. La canonical
// vive en app/parental/session.ts.
import { PARENT_SESSION_COOKIE } from "@/app/parental/session";

const SESSION_MAX_AGE = 30 * 60; // 30 min

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const limited = rateLimit(`parental-pin:set:${user.id}`, 10, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const data =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const pin = typeof data?.pin === "string" ? data.pin : "";
  const currentPin =
    typeof data?.currentPin === "string" ? data.currentPin : null;
  if (!/^\d{4}$/.test(pin)) return NextResponse.json({ error: "PIN debe tener 4 dígitos" }, { status: 400 });

  // Si ya tiene PIN, requerir el actual para cambiarlo
  if (user.parentalPin) {
    if (!currentPin || !(await bcrypt.compare(currentPin, user.parentalPin))) {
      return NextResponse.json({ error: "PIN actual incorrecto" }, { status: 403 });
    }
  }

  const hash = await bcrypt.hash(pin, 10);
  await prisma.user.update({ where: { id: user.id }, data: { parentalPin: hash } });
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!user.parentalPin) return NextResponse.json({ error: "no-pin-set" }, { status: 400 });

  const limited = rateLimit(`parental-pin:verify:${user.id}`, 5, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const data =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const pin = typeof data?.pin === "string" ? data.pin : "";
  const ok = await bcrypt.compare(pin ?? "", user.parentalPin);
  if (!ok) return NextResponse.json({ error: "PIN incorrecto" }, { status: 403 });

  const c = await cookies();
  c.set(PARENT_SESSION_COOKIE, "1", {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const c = await cookies();
  c.delete(PARENT_SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
