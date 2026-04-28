// lib/auth.ts
// =============================================================================
// Capa de abstracción de autenticación.
// Toda la app llama a estas funciones, NO llama a Supabase directamente.
// Si mañana te vas a Clerk, NextAuth o Lucia, reemplazás solo este archivo.
// =============================================================================

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "./supabase/server";
import { prisma } from "./prisma";
import type { User as AppUser, Child } from "@prisma/client";

export type AuthUser = AppUser & { children: Child[] };
export const ACTIVE_CHILD_COOKIE = "lm_child";

/** Devuelve el usuario logueado + sus hijos. `null` si no hay sesión. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Sincronizá con tu DB (upsert) — así User siempre existe después del signup.
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: { email: user.email ?? "" },
    create: {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? null,
    },
    include: { children: true },
  });

  return dbUser;
}

/** Requiere sesión — tirar redirect si no hay. Usalo en páginas protegidas. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    // redirect() lanza una excepción y nunca retorna; el cast informa a TS.
    const { redirect } = await import("next/navigation");
    redirect("/auth/login");
  }
  return user as AuthUser;
}

/** Helpers para Server Actions / API routes */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

/** Lee el id del child activo desde cookie. */
export async function getActiveChildId(): Promise<string | null> {
  const c = await cookies();
  return c.get(ACTIVE_CHILD_COOKIE)?.value ?? null;
}
