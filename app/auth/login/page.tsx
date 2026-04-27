"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true); setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/auth/post-login");
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "apple") {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-lilac-soft to-cream md:bg-cream">
      <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6 text-ink-soft text-sm font-bold z-10">← Volver</Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-block"><Lumi size={90} variant="default"/></div>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">¡Hola de nuevo!</h1>
          <p className="text-ink-soft text-sm font-bold">Lumi te estaba esperando 🦙</p>
        </div>

        <div className="bg-white md:border-2 md:border-white rounded-3xl p-6 md:p-8 md:shadow-xl" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="space-y-3">
            <input placeholder="tu@email.com" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"/>
            <input placeholder="Contraseña" type="password" value={pass} onChange={e => setPass(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sky outline-none transition"/>
            <Link href="/auth/forgot" className="block text-right text-sky font-bold text-sm">¿Olvidaste tu contraseña?</Link>
          </div>

          {error && <div className="mt-3 text-pink text-xs font-bold text-center">{error}</div>}

          <button onClick={handleLogin} disabled={loading || !email || !pass}
            className="btn-chunky mt-4 w-full py-4 rounded-2xl bg-mint text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #4DA86A" }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-lilac-soft"/>
            <span className="text-xs text-ink-mute font-bold">O</span>
            <div className="flex-1 h-px bg-lilac-soft"/>
          </div>

          <div className="space-y-2">
            <button onClick={() => handleOAuth("google")}
              className="btn-chunky w-full py-3 rounded-2xl bg-white border-2 border-cream font-bold text-ink flex items-center justify-center gap-2 hover:border-ink/20">
              <span>🔵</span> Continuar con Google
            </button>
            <button onClick={() => handleOAuth("apple")}
              className="btn-chunky w-full py-3 rounded-2xl bg-ink text-white font-bold flex items-center justify-center gap-2">
              <span>🍎</span> Continuar con Apple
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-ink-soft font-bold">
          ¿Nuevo? <Link href="/auth/signup" className="text-pink">Crear cuenta</Link>
        </div>
      </main>
    </div>
  );
}
