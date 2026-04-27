// app/settings/pin/page.tsx — cambiar PIN parental
"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePinPage() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setErr(null);
    if (!/^\d{4}$/.test(pin)) return setErr("PIN debe tener 4 dígitos");
    if (pin !== pin2) return setErr("Los PIN nuevos no coinciden");
    setLoading(true);
    const r = await fetch("/api/parental-pin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, currentPin }),
    });
    const data = await r.json().catch(() => ({}));
    setLoading(false);
    if (!r.ok) return setErr(data.error ?? "Error");
    setOk(true);
    setTimeout(() => router.push("/settings"), 1200);
  }

  function PinInput({ value, set, label }: { value: string; set: (v: string) => void; label: string }) {
    return (
      <div>
        <label className="text-xs font-black text-ink-soft tracking-wider">{label}</label>
        <input type="tel" inputMode="numeric" maxLength={4} value={value}
          onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="mt-1 w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-fredoka text-2xl font-bold text-ink text-center tracking-[0.5em] focus:border-lilac outline-none"/>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      <header className="sticky top-0 bg-white border-b border-ink/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/settings" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <h1 className="font-fredoka text-lg font-bold text-ink">🔒 Cambiar PIN</h1>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <PinInput value={currentPin} set={setCurrentPin} label="PIN ACTUAL"/>
          <PinInput value={pin} set={setPin} label="NUEVO PIN"/>
          <PinInput value={pin2} set={setPin2} label="REPETIR NUEVO PIN"/>

          {err && <div className="text-pink text-xs font-bold text-center">{err}</div>}
          {ok && <div className="text-mint text-xs font-bold text-center">✓ PIN actualizado</div>}

          <button onClick={save} disabled={loading || !currentPin || !pin || !pin2}
            className="btn-chunky w-full py-4 rounded-2xl bg-lilac text-white font-fredoka text-lg font-bold disabled:opacity-50"
            style={{ boxShadow: "0 5px 0 #7B5CC4" }}>
            {loading ? "Guardando..." : "Guardar PIN"}
          </button>
        </div>
      </main>
    </div>
  );
}
