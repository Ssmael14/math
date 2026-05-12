// middleware.ts
// Protege rutas privadas. Sólo chequea la PRESENCIA de la cookie de sesión
// de Better Auth — no valida firma ni hace queries a la DB (eso pasa en cada
// page/API route via getCurrentUser).
//
// Esto mantiene el middleware liviano y compatible con Edge runtime. Better
// Auth provee `getSessionCookie` que conoce los nombres correctos (con o sin
// el prefijo __Secure- en HTTPS).

import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = [
  "/home",
  "/units",
  "/lesson",
  "/review",
  "/victory",
  "/level-up",
  "/profile",
  "/shop",
  "/league",
  "/achievements",
  "/parental",
  "/settings",
];
const AUTH_PAGES = ["/auth/login", "/auth/signup", "/auth/forgot", "/auth/reset"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = getSessionCookie(request);
  const logged = !!sessionCookie;

  // No logueado intentando ir a ruta protegida → login
  if (!logged && PROTECTED.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Ya logueado yendo a login/signup → home
  if (logged && AUTH_PAGES.some((p) => path === p || path.startsWith(p + "/"))) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
