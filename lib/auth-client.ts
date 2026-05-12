// lib/auth-client.ts
// Cliente de BetterAuth para usar en Client Components
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signUp, signIn, signOut } = authClient;
