// lib/auth.ts
// =============================================================================
// Helpers server-side para acceder al usuario actual.
//
// Usamos la API oficial de Better Auth (`auth.api.getSession`) — ella se
// encarga de leer la cookie correcta (incluyendo el prefijo __Secure- en
// HTTPS), verificar la firma y validar la expiración.
// =============================================================================

import { cookies, headers } from "next/headers";
import { auth } from "./auth-config";
import { prisma } from "./prisma";
import type { User as AppUser, Child } from "@prisma/client";

export type AuthUser = AppUser & { children: Child[] };
export const ACTIVE_CHILD_COOKIE = "lm_child";

/** Devuelve la sesión actual usando la API oficial de Better Auth. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Devuelve el usuario logueado + sus hijos. `null` si no hay sesión. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session?.user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { children: true },
  });
  return dbUser;
}

/** Requiere sesión — tira redirect si no hay. Usalo en páginas protegidas. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    // redirect() lanza una excepción y nunca retorna.
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
