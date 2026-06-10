"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { authClient } from "@/lib/auth/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    if (!acceptedTerms) {
      setError("Acepta los términos para crear tu cuenta.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await authClient.signUp.email({
        email: form.email,
        password: form.pass,
        name: form.name,
      });
      if (result.error) {
        setError(result.error.message || "Error al crear la cuenta");
      } else {
        router.push("/profile/create");
        router.refresh();
      }
    } catch (err) {
      setError("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google") {
    if (!acceptedTerms) {
      setError("Acepta los términos para continuar con Google.");
      return;
    }

    setOauthLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/auth/post-login",
      });
    } catch (err) {
      setError("Error al conectar con Google");
      setOauthLoading(false);
    }
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
            <Lumi size={80} variant="sparkly" />
          </div>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">
            Crear cuenta
          </h1>
          <p className="text-ink-soft text-sm font-bold">De papá o mamá 👨‍👩‍👧</p>
        </div>

        <div
          className="bg-white md:border-2 md:border-white rounded-3xl p-6 md:p-8"
          style={{ boxShadow: "var(--shadow-chunky)" }}
        >
          <div className="space-y-3">
            <input
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-sky-soft bg-sky-soft/45 font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-sky-soft bg-sky-soft/45 font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
            <input
              placeholder="Contraseña (mín 8)"
              type="password"
              value={form.pass}
              onChange={(e) => setForm({ ...form, pass: e.target.value })}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-sky-soft bg-sky-soft/45 font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"
            />
          </div>

          {error && (
            <div className="mt-3 text-pink text-xs font-bold text-center">
              {error}
            </div>
          )}

          <label className="flex items-start gap-2 mt-4 text-xs text-ink-soft font-bold leading-relaxed">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 accent-sky"
            />
            <span>
              Acepto los <span className="text-sky">Términos</span> y la{" "}
              <span className="text-sky">Política de privacidad</span> (COPPA).
            </span>
          </label>

          <button
            onClick={handleSignup}
            disabled={
              loading ||
              oauthLoading ||
              !acceptedTerms ||
              !form.email ||
              !form.pass ||
              !form.name
            }
            className="btn-chunky mt-5 w-full py-4 rounded-2xl bg-sky text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #2445D8" }}
          >
            {loading ? "Creando..." : "Crear cuenta →"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-sky-soft" />
            <span className="text-xs text-ink-mute font-bold">O</span>
            <div className="flex-1 h-px bg-sky-soft" />
          </div>

          <button
            onClick={() => handleOAuth("google")}
            disabled={loading || oauthLoading || !acceptedTerms}
            className="btn-chunky w-full py-3 rounded-2xl bg-white border-2 border-sky-soft font-bold text-ink flex items-center justify-center gap-2 hover:border-sky disabled:opacity-50"
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
            <span>
              {oauthLoading ? "Conectando..." : "Continuar con Google"}
            </span>
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-ink-soft font-bold">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-sky">
            Iniciar sesión
          </Link>
        </div>
      </main>
    </div>
  );
}
