// lib/auth-client.ts
// Cliente de Better Auth para usar desde "use client" components.
// Las páginas /auth/* importan los helpers desde acá en lugar de llamar
// directo a /api/auth/*.

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Alias para los flows de password reset.
// Better Auth 1.x → `requestPasswordReset` (manda el mail con sendResetPassword)
//                + `resetPassword` (usa el token del link).
export const requestPasswordReset = authClient.requestPasswordReset;
export const resetPassword = authClient.resetPassword;
