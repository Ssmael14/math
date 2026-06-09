"use client";
import Link from "next/link";
import { useState } from "react";
import { Lumi } from "@/components/Lumi";
import { requestPasswordReset } from "@/lib/auth/client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setError(null);
    // Better Auth firma un token, lo agrega a la URL como ?token=... y
    // dispara sendResetPassword() en auth-config.ts (Resend).
    const { error } = await requestPasswordReset({
      email,
      redirectTo: "/auth/reset",
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "No pudimos enviar el mail. Prueba de nuevo.");
      return;
    }
    setSent(true);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-sky-soft via-white to-cream md:bg-cream">
      <Link
        href="/auth/login"
        className="absolute top-4 left-4 md:top-6 md:left-6 text-ink-soft text-sm font-bold z-10"
      >
        ← Volver
      </Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-block">
            <Lumi size={80} variant="sleepy" />
          </div>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">
            {sent ? "¡Enviado!" : "Recuperar contraseña"}
          </h1>
          <p className="text-ink-soft text-sm font-bold mt-1">
            {sent
              ? "Revisa tu email para el link ✨"
              : "Te mandamos un link al email para elegir una nueva"}
          </p>
        </div>

        <div
          className="bg-white rounded-3xl p-6 md:p-8"
          style={{ boxShadow: "var(--shadow-chunky)" }}
        >
          {!sent && (
            <input
              placeholder="tu@email.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-sky-soft bg-sky-soft/45 font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
          )}
          {error && (
            <div className="mt-3 text-pink text-xs font-bold text-center">
              {error}
            </div>
          )}
          <button
            onClick={sent ? () => setSent(false) : handleReset}
            disabled={loading || (!sent && !email)}
            className="btn-chunky mt-4 w-full py-4 rounded-2xl bg-sky text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #2445D8" }}
          >
            {loading ? "Enviando..." : sent ? "Reenviar email" : "Enviar link"}
          </button>
        </div>
      </main>
    </div>
  );
}
