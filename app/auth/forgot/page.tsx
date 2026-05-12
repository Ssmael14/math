"use client";
import Link from "next/link";
import { useState } from "react";
import { Lumi } from "@/components/Lumi";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    setLoading(true);
    setError(null);
    try {
      // BetterAuth usa un endpoint para solicitar reset de contraseña
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error al solicitar reset");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "Error al solicitar reset de contraseña");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-lilac-soft to-cream md:bg-cream">
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
              ? "Revisá tu email para el link mágico ✨"
              : "Te mandamos un link mágico al email"}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-pink outline-none transition"
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
            className="btn-chunky mt-4 w-full py-4 rounded-2xl bg-pink text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #D14A6A" }}
          >
            {loading
              ? "Enviando..."
              : sent
                ? "Reenviar email"
                : "Enviar link mágico"}
          </button>
        </div>
      </main>
    </div>
  );
}
