// middleware.ts
// Protege rutas privadas usando BetterAuth
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const PROTECTED = [
  "/home",
  "/units",
  "/lesson",
  "/exercise",
  "/victory",
  "/level-up",
  "/profile",
  "/shop",
  "/league",
  "/achievements",
  "/parental",
  "/settings",
];
const AUTH_PAGES = ["/auth/login", "/auth/signup", "/auth/forgot"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  // Obtener el token de sesión desde las cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;

  let sessionExists = false;
  if (sessionToken) {
    // Verificar si la sesión existe y es válida
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });
    sessionExists = !!(session && session.expiresAt > new Date());
  }

  // No logueado intentando ir a ruta protegida → login
  if (!sessionExists && PROTECTED.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Ya logueado yendo a login/signup → home
  if (sessionExists && AUTH_PAGES.includes(path)) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*))",
  ],
};
