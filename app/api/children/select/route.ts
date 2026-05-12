// app/api/children/select/route.ts — setea el child activo en cookie
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE } from "@/lib/auth/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { childId } = await req.json();
  const child = user.children.find((c) => c.id === childId);
  if (!child) return NextResponse.json({ error: "not your child" }, { status: 403 });
  const c = await cookies();
  c.set(ACTIVE_CHILD_COOKIE, childId, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return NextResponse.json({ ok: true });
}
