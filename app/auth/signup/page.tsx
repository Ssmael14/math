"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", pass: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup() {
    setLoading(true); setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.pass,
      options: {
        data: { name: form.name },
        emailRedirectTo: `${location.origin}/auth/callback?next=/profile/create`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    router.push("/profile/create");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-peach-soft to-cream md:bg-cream">
      <Link href="/auth/login" className="absolute top-4 left-4 md:top-6 md:left-6 text-ink-soft text-sm font-bold z-10">← Volver</Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-block"><Lumi size={80} variant="magical"/></div>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">Crear cuenta</h1>
          <p className="text-ink-soft text-sm font-bold">De papá o mamá 👨‍👩‍👧</p>
        </div>

        <div className="bg-white md:border-2 md:border-white rounded-3xl p-6 md:p-8" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="space-y-3">
            <input placeholder="Tu nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sun outline-none transition"/>
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sun outline-none transition"/>
            <input placeholder="Contraseña (mín 6)" type="password" value={form.pass} onChange={e => setForm({...form, pass: e.target.value})}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-sun outline-none transition"/>
          </div>

          {error && <div className="mt-3 text-pink text-xs font-bold text-center">{error}</div>}

          <label className="flex items-start gap-2 mt-4 text-xs text-ink-soft font-bold leading-relaxed">
            <input type="checkbox" defaultChecked className="mt-0.5 accent-mint"/>
            <span>Acepto los <span className="text-sky">Términos</span> y la <span className="text-sky">Política de privacidad</span> (COPPA).</span>
          </label>

          <button onClick={handleSignup} disabled={loading || !form.email || !form.pass}
            className="btn-chunky mt-5 w-full py-4 rounded-2xl bg-sun text-ink font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #E8A500" }}>
            {loading ? "Creando..." : "Crear cuenta →"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-ink-soft font-bold">
          ¿Ya tenés cuenta? <Link href="/auth/login" className="text-pink">Iniciar sesión</Link>
        </div>
      </main>
    </div>
  );
}
