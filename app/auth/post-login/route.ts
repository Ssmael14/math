// app/auth/post-login/route.ts
// Después de login, decide a dónde mandar al user:
// - sin hijos → /profile/create
// - 1 hijo → /home (auto-activo)
// - 2+ hijos → /profile/select
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  if (user.children.length === 0) {
    return NextResponse.redirect(new URL("/profile/create", req.url));
  }
  if (user.children.length === 1) {
    const c = await cookies();
    c.set(ACTIVE_CHILD_COOKIE, user.children[0].id, {
      httpOnly: true, sameSite: "lax", path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return NextResponse.redirect(new URL("/home", req.url));
  }
  return NextResponse.redirect(new URL("/profile/select", req.url));
}
