// lib/auth-config.ts
// Configuración de Better Auth.
// Esta instancia se usa en:
//   - app/api/auth/[...auth]/route.ts → expone /api/auth/* al browser
//   - lib/auth.ts                     → helpers server-side (getCurrentUser, etc.)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { prisma } from "../prisma";
import { brand } from "@/lib/brand";

// El cliente de Resend sólo se construye si hay API key — así en dev sin
// SMTP la app sigue funcionando y el link de reset se loguea por consola.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env.BETTER_AUTH_SECRET!,
  basePath: "/api/auth",
  baseURL: process.env.BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Manda el mail de "olvidé mi contraseña" cuando alguien llama
    // authClient.forgetPassword({ email, redirectTo }). El `url` ya incluye
    // el token firmado por Better Auth — sólo lo enviamos al destinatario.
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        // Dev sin Resend: dejamos el link en consola para poder probar
        // el flujo sin SMTP real.
        console.warn(
          `[auth] RESEND_API_KEY no seteada — link de reset para ${user.email}:`,
        );
        console.warn(url);
        return;
      }
      await resend.emails.send({
        from: `noreply@${brand.domain}`,
        to: user.email,
        subject: `Recuperá tu contraseña · ${brand.appName}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
            <h1 style="font-size: 24px; color: #3D2E4F;">Hola, soy ${brand.mascotName}</h1>
            <p style="color: #555;">Hacé click acá para elegir una nueva contraseña:</p>
            <p style="margin: 24px 0;">
              <a href="${url}"
                 style="background: #FFC94A; color: #3D2E4F; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800;">
                Cambiar contraseña
              </a>
            </p>
            <p style="color: #888; font-size: 13px;">
              Si no fuiste vos, ignorá este mail.
            </p>
          </div>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Plugin oficial de Better Auth para Next 15 App Router — hace que las
  // cookies de sesión se seteen correctamente desde Server Actions y route
  // handlers. Sin esto algunos flujos (OAuth callback, password reset) no
  // setean la sesión al volver.
  plugins: [nextCookies()],
});
