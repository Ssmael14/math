// app/profile/edit/[id]/page.tsx — editar/borrar perfil de un hijo
"use client";
import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const AVATARS = ["🦁","🐯","🦊","🐼","🐻","🐸","🦄","🐙","🦖"];

export default function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState(5);
  const [avatar, setAvatar] = useState("🦁");
  const [pending, start] = useTransition();
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/children").then((r) => r.json()).then((d) => {
      const c = d.children?.find((c: { id: string }) => c.id === id);
      if (c) { setName(c.name); setAge(c.age); setAvatar(c.avatar); }
    });
  }, [id]);

  function save() {
    start(async () => {
      const r = await fetch(`/api/children/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, avatar }),
      });
      if (!r.ok) { setErr("Error guardando"); return; }
      router.push("/profile"); router.refresh();
    });
  }

  function destroy() {
    start(async () => {
      const r = await fetch(`/api/children/${id}`, { method: "DELETE" });
      if (!r.ok) { setErr("Error borrando"); return; }
      router.push("/profile/select"); router.refresh();
    });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-peach-soft to-cream">
      <div className="px-5 pt-4">
        <Link href="/profile" className="text-ink-soft text-sm font-bold">← Volver</Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-10" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="text-center mb-5">
            <div className="text-[10px] font-black text-pink tracking-widest">EDITAR PERFIL</div>
            <h1 className="font-fredoka text-2xl font-bold text-ink mt-1">Cambiá lo que quieras</h1>
          </div>

          <label className="text-xs font-black text-ink-soft tracking-wider">NOMBRE</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-cream bg-cream font-fredoka text-xl font-bold text-ink text-center focus:border-sun outline-none"/>

          <label className="block mt-4 text-xs font-black text-ink-soft tracking-wider">EDAD</label>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {[4,5,6,7].map((a) => (
              <button key={a} onClick={() => setAge(a)} className={`py-3 rounded-2xl font-fredoka text-xl font-bold border-2 ${age===a?"bg-sun border-sun-deep text-ink":"bg-cream border-cream text-ink-soft"}`} style={{ boxShadow: "var(--shadow-chunky)" }}>{a}</button>
            ))}
          </div>

          <label className="block mt-4 text-xs font-black text-ink-soft tracking-wider">AVATAR</label>
          <div className="mt-2 grid grid-cols-3 md:grid-cols-5 gap-2">
            {AVATARS.map((a) => (
              <button key={a} onClick={() => setAvatar(a)} className={`aspect-square rounded-2xl text-3xl flex items-center justify-center border-2 ${avatar===a?"bg-sun border-sun-deep":"bg-cream border-cream"}`} style={{ boxShadow: "var(--shadow-chunky)" }}>{a}</button>
            ))}
          </div>

          {err && <div className="mt-3 text-pink text-xs font-bold text-center">{err}</div>}

          <button onClick={save} disabled={pending || !name.trim()}
            className="btn-chunky mt-6 w-full py-4 rounded-2xl bg-mint text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #4DA86A" }}>
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>

          <div className="mt-6 pt-5 border-t border-cream">
            {!confirmDel ? (
              <button onClick={() => setConfirmDel(true)} className="w-full py-3 rounded-2xl text-pink font-bold text-sm">
                🗑️ Borrar este perfil
              </button>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-ink mb-3">¿Seguro? Se borra el progreso, gemas, medallas y todo.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmDel(false)} className="flex-1 py-3 rounded-2xl bg-cream font-bold text-ink-soft">Cancelar</button>
                  <button onClick={destroy} disabled={pending} className="flex-1 py-3 rounded-2xl bg-pink text-white font-bold disabled:opacity-50">
                    Sí, borrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
