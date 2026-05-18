// lib/auth.ts
// =============================================================================
// Helpers server-side para acceder al usuario actual.
//
// Usamos la API oficial de Better Auth (`auth.api.getSession`) — ella se
// encarga de leer la cookie correcta (incluyendo el prefijo __Secure- en
// HTTPS), verificar la firma y validar la expiración.
// =============================================================================

import { cookies, headers } from "next/headers";
import { auth } from "./config";
import { prisma } from "../prisma";
import type { User as AppUser, Child } from "@prisma/client";

export type AuthUser = AppUser & { children: Child[] };
export const ACTIVE_CHILD_COOKIE = "lm_child";
export const ACTIVE_PATH_COOKIE = "lm_path";

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

/**
 * ¿El email está en la lista de admins? Lista en `ADMIN_EMAILS` (separada
 * por comas). Aún no hay modelo de roles; esto gatea el panel admin mínimo.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allow.includes(email.toLowerCase());
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

/** Lee el slug del LearningPath activo desde cookie. */
export async function getActivePathSlug(): Promise<string | null> {
  const c = await cookies();
  return c.get(ACTIVE_PATH_COOKIE)?.value ?? null;
}
