// app/settings/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  isSoundsEnabled,
  isHapticsEnabled,
  setSoundsEnabled,
  setHapticsEnabled,
  playCorrect,
} from "@/lib/audio";

export default function SettingsPage() {
  const router = useRouter();
  // Inicializamos en `true` por SSR; sincronizamos con localStorage en mount.
  const [sound, setSound] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    setSound(isSoundsEnabled());
    setHaptic(isHapticsEnabled());
  }, []);

  function toggleSound(next: boolean) {
    setSound(next);
    setSoundsEnabled(next);
    if (next) playCorrect(); // preview al prender
  }
  function toggleHaptic(next: boolean) {
    setHaptic(next);
    setHapticsEnabled(next);
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink">⚙️ Ajustes</h1>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
          <Section title="Sonido y vibración">
            <Toggle label="🔊 Efectos de sonido" value={sound} onChange={toggleSound}/>
            <Toggle label="📳 Vibración" value={haptic} onChange={toggleHaptic}/>
          </Section>

          <Section title="Notificaciones">
            <Toggle label="🔔 Recordatorios diarios" value={notif} onChange={setNotif}/>
          </Section>

          <Section title="Cuenta">
            <Link href="/parental" className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>👨‍👩‍👧 Modo padres</span><span className="text-ink-mute">›</span>
            </Link>
            <Link href="/settings/pin" className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>🔒 Cambiar PIN parental</span><span className="text-ink-mute">›</span>
            </Link>
            <Link href="/auth/forgot" className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>🔑 Cambiar contraseña</span><span className="text-ink-mute">›</span>
            </Link>
            <button onClick={handleLogout} className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-pink mt-2" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>🚪 Cerrar sesión</span><span className="text-ink-mute">›</span>
            </button>
          </Section>

          <div className="text-center text-xs font-bold text-ink-mute pt-4">LearnMath v0.1 · Hecho con 🦙 y matemática</div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-black text-ink-soft tracking-widest mb-2 px-1">{title.toUpperCase()}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
      <span>{label}</span>
      <div className={`w-12 h-7 rounded-full p-1 transition-colors ${value ? "bg-mint" : "bg-cream"}`}>
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`} style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}/>
      </div>
    </button>
  );
}
