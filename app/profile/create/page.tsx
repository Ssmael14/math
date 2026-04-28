"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";

const AVATARS = ["🦁","🐯","🦊","🐼","🐻","🐸","🦄","🐙","🦖"];

export default function CreateProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("Sofía");
  const [age, setAge] = useState(5);
  const [avatar, setAvatar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setLoading(true); setError(null);
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age, avatar: AVATARS[avatar] }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return setError(data.error ?? "Error creando perfil");
    }
    router.push("/home");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-peach-soft to-cream md:from-cream md:to-cream"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Header mobile */}
      <div className="px-5 pt-4 md:hidden">
        <Link href="/auth/signup" className="text-ink-soft text-sm font-bold">← Volver</Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6 md:py-12">
        <div className="w-full max-w-md bg-white md:border-4 md:border-white rounded-3xl p-6 md:p-10" style={{ boxShadow: "var(--shadow-chunky)" }}>
          {/* Lumi saluda */}
          <div className="flex flex-col items-center -mt-16 md:-mt-20 mb-2">
            <div className="bg-sun-soft rounded-full p-3 border-4 border-white" style={{ boxShadow: "var(--shadow-chunky)" }}>
              <Lumi size={80} mood="happy"/>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-[10px] font-black text-pink tracking-widest">PERFIL DEL NIÑO</div>
            <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink mt-1">¡Hola! Contame de vos</h1>
            <p className="text-sm text-ink-soft font-bold mt-1">Lumi quiere conocerte 🦙</p>
          </div>

          <div>
            <label className="text-xs font-black text-ink-soft tracking-wider">TU NOMBRE</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-cream bg-cream font-fredoka text-xl font-bold text-ink text-center focus:border-sun outline-none transition"/>
          </div>

          <div className="mt-4">
            <label className="text-xs font-black text-ink-soft tracking-wider">TU EDAD</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {[4, 5, 6, 7].map(a => (
                <button key={a} onClick={() => setAge(a)} className={`btn-chunky py-3 rounded-2xl font-fredoka text-xl font-bold border-2 ${
                  age === a ? "bg-sun border-sun-deep text-ink" : "bg-cream border-cream text-ink-soft"
                }`} style={{ boxShadow: "var(--shadow-chunky)" }}>{a}</button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-black text-ink-soft tracking-wider">ELEGÍ TU AVATAR</label>
            <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
              {AVATARS.map((a, i) => (
                <button key={i} onClick={() => setAvatar(i)} className={`btn-chunky aspect-square rounded-2xl text-3xl md:text-4xl flex items-center justify-center border-2 ${
                  avatar === i ? "bg-sun border-sun-deep" : "bg-cream border-cream"
                }`} style={{ boxShadow: "var(--shadow-chunky)" }}>{a}</button>
              ))}
            </div>
          </div>

          {error && <div className="mt-3 text-pink text-xs font-bold text-center">{error}</div>}
          <button onClick={handleCreate} disabled={loading || !name.trim()}
            className="btn-chunky mt-6 w-full py-4 rounded-2xl bg-mint text-white text-center font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #4DA86A" }}>
            {loading ? "Creando..." : "¡Empezar! 🚀"}
          </button>
        </div>
      </main>
    </div>
  );
}
