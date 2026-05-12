// app/auth/post-login/route.ts
// Decide a dónde mandar al user después de login:
//   - sin hijos        → /profile/create
//   - 2+ hijos         → /profile/select (que elija con cuál entrar)
//   - 1 hijo sin enroll → /subjects (que elija materia)
//   - 1 hijo enrolled  → /home (mapa de unidades)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, ACTIVE_CHILD_COOKIE } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", req.url));

  if (user.children.length === 0) {
    return NextResponse.redirect(new URL("/profile/create", req.url));
  }
  if (user.children.length > 1) {
    return NextResponse.redirect(new URL("/profile/select", req.url));
  }

  // Único child: lo activamos y decidimos según si tiene enrollments.
  const childId = user.children[0].id;
  const c = await cookies();
  c.set(ACTIVE_CHILD_COOKIE, childId, {
    httpOnly: true, sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const enrollmentCount = await prisma.enrollment.count({ where: { childId } });
  if (enrollmentCount === 0) {
    return NextResponse.redirect(new URL("/subjects", req.url));
  }
  return NextResponse.redirect(new URL("/home", req.url));
}
