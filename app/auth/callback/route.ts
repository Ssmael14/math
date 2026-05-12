// app/auth/callback/route.ts
// BetterAuth maneja el callback automáticamente,
// pero agregamos este endpoint para redirigir después de OAuth.
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/auth/post-login";

  // Verificar si la sesión existe
  const session = await getSession();
  if (session) {
    return NextResponse.redirect(new URL(next, origin));
  }

  // Si no hay sesión, redirigir al login con error
  return NextResponse.redirect(new URL("/auth/login?error=oauth", origin));
}
