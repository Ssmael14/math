// app/auth/reset/page.tsx — definir nueva contraseña tras link de recovery
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPage() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    if (pass.length < 6) return setErr("Mínimo 6 caracteres");
    if (pass !== pass2) return setErr("Las contraseñas no coinciden");
    setLoading(true); setErr(null);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password: pass });
    setLoading(false);
    if (error) return setErr(error.message);
    setDone(true);
    setTimeout(() => { router.push("/home"); router.refresh(); }, 1500);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-mint-soft to-cream md:bg-cream">
      <Link href="/auth/login" className="absolute top-4 left-4 text-ink-soft text-sm font-bold z-10">← Volver</Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <Lumi size={80} mood={done ? "celebrate" : "happy"}/>
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">
            {done ? "¡Lista!" : "Nueva contraseña"}
          </h1>
          <p className="text-ink-soft text-sm font-bold mt-1">
            {done ? "Te llevamos a casa..." : "Elegí algo que te acuerdes 🔐"}
          </p>
        </div>

        {!done && (
          <div className="bg-white rounded-3xl p-6 md:p-8 space-y-3" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <input type="password" placeholder="Nueva contraseña" value={pass} onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-mint outline-none transition"/>
            <input type="password" placeholder="Repetir contraseña" value={pass2} onChange={(e) => setPass2(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-mint outline-none transition"/>
            {err && <div className="text-pink text-xs font-bold text-center">{err}</div>}
            <button onClick={save} disabled={loading || !pass || !pass2}
              className="btn-chunky w-full py-4 rounded-2xl bg-mint text-white font-fredoka text-lg font-bold disabled:opacity-50"
              style={{ boxShadow: "0 5px 0 #4DA86A" }}>
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
