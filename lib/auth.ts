// lib/auth.ts
// =============================================================================
// Capa de abstracción de autenticación con BetterAuth.
// Toda la app llama a estas funciones, NO llama a BetterAuth directamente.
// =============================================================================

import { auth } from "./auth-config";
import { prisma } from "./prisma";
import type { User as AppUser, Child } from "@prisma/client";
import { cookies } from "next/headers";

export type AuthUser = AppUser & { children: Child[] };
export const ACTIVE_CHILD_COOKIE = "lm_child";

/** Devuelve la sesión actual desde las cookies */
export async function getSession() {
  const cookieStore = await cookies();

  // BetterAuth guarda el token de sesión en una cookie
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!sessionToken) return null;

  // Buscar la sesión en la DB
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: { include: { children: true } } },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return {
    user: session.user,
    session: session,
  };
}

/** Devuelve el usuario logueado + sus hijos. `null` si no hay sesión. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const sessionData = await getSession();
  if (!sessionData) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionData.user.id },
    include: { children: true },
  });

  return dbUser as AuthUser | null;
}

/** Requiere sesión — tirar redirect si no hay. Usalo en páginas protegidas. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/auth/login");
  }
  return user as AuthUser;
}

/** Lee el id del child activo desde cookie. */
export async function getActiveChildId(): Promise<string | null> {
  const c = await cookies();
  return c.get(ACTIVE_CHILD_COOKIE)?.value ?? null;
}
