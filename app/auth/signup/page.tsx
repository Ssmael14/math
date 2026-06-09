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
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
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
              defaultChecked
              className="mt-0.5 accent-sky"
            />
            <span>
              Acepto los <span className="text-sky">Términos</span> y la{" "}
              <span className="text-sky">Política de privacidad</span> (COPPA).
            </span>
          </label>

          <button
            onClick={handleSignup}
            disabled={loading || !form.email || !form.pass || !form.name}
            className="btn-chunky mt-5 w-full py-4 rounded-2xl bg-sky text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #2445D8" }}
          >
            {loading ? "Creando..." : "Crear cuenta →"}
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
