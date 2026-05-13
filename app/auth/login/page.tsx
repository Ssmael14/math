"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signIn.email({
        email,
        password: pass,
      });
      if (result.error) {
        setError(result.error.message || "Error al iniciar sesión");
      } else {
        router.push("/auth/post-login");
        router.refresh();
      }
    } catch (err) {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google") {
    try {
      // Better Auth ya garantiza que la sesión existe cuando redirige al
      // callbackURL, así que vamos directo al post-login (decide a dónde
      // mandar al user según si tiene hijos o no).
      await authClient.signIn.social({
        provider,
        callbackURL: "/auth/post-login",
      });
    } catch (err) {
      setError("Error al conectar con Google");
    }
  }

  return (
    <div className="min-h-dvh flex flex-col md:items-center md:justify-center bg-linear-to-b from-lilac-soft to-cream md:bg-cream">
      <Link
        href="/"
        className="absolute top-4 left-4 md:top-6 md:left-6 text-ink-soft text-sm font-bold z-10"
      >
        ← Volver
      </Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-block">
            <Lumi size={90} />
          </div>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">
            ¡Hola de nuevo!
          </h1>
          <p className="text-ink-soft text-sm font-bold">
            Lumi te estaba esperando 🦙
          </p>
        </div>

        <div
          className="bg-white md:border-2 md:border-white rounded-3xl p-6 md:p-8 md:shadow-xl"
          style={{ boxShadow: "var(--shadow-chunky)" }}
        >
          <div className="space-y-3">
            <input
              placeholder="tu@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
            <input
              placeholder="Contraseña"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
            <Link
              href="/auth/forgot"
              className="block text-right text-sky font-bold text-sm"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="mt-3 text-pink text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !pass}
            className="btn-chunky mt-4 w-full py-4 rounded-2xl bg-mint text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #4DA86A" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-lilac-soft" />
            <span className="text-xs text-ink-mute font-bold">O</span>
            <div className="flex-1 h-px bg-lilac-soft" />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleOAuth("google")}
              className="btn-chunky w-full py-3 rounded-2xl bg-white border-2 border-cream font-bold text-ink flex items-center justify-center gap-2 hover:border-ink/20"
            >
              <svg
                className="inline-block"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M9 3.48c1.69 0 2.86.73 3.52 1.34l2.61-2.5C13.9.86 11.7 0 9 0 5.09 0 1.87 2.24.62 5.41l3.34 2.59C4.96 5.01 6.8 3.48 9 3.48z"
                  fill="#4285F4"
                />
                <path
                  d="M17.64 9.2c0-.63-.06-1.24-.18-1.82H9v3.44h4.84c-.21 1.12-.82 2.08-1.74 2.73l2.82 2.2c1.64-1.52 2.9-3.74 2.9-6.55z"
                  fill="#34A853"
                />
                <path
                  d="M3.96 10.9a5.4 5.4 0 0 1 0-3.8L.62 4.5A8.9 8.9 0 0 0 0 9c0 1.43.34 2.78.95 3.98l3.01-2.08z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 18c2.43 0 4.47-.8 5.96-2.16l-2.82-2.2c-.83.56-1.9.9-3.14.9-2.2 0-4.04-1.53-4.68-3.6L.62 13.3C1.87 16.47 5.09 18 9 18z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-ink-soft font-bold">
          ¿Nuevo?{" "}
          <Link href="/auth/signup" className="text-pink">
            Crear cuenta
          </Link>
        </div>
      </main>
    </div>
  );
}
