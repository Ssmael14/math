// app/parental/gate/PinForm.tsx — input de 4 dígitos
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function PinForm({ mode }: { mode: "create" | "verify" }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState(""); // confirmar (solo create)
  const [step, setStep] = useState<"first" | "confirm">("first");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, [step]);

  async function submit() {
    setErr(null);
    if (mode === "verify") {
      if (pin.length !== 4) return setErr("4 dígitos");
      setLoading(true);
      const r = await fetch("/api/parental-pin", { method: "PUT", body: JSON.stringify({ pin }) });
      setLoading(false);
      if (!r.ok) { setErr("PIN incorrecto"); setPin(""); return; }
      router.push("/parental"); router.refresh();
      return;
    }

    // CREATE
    if (step === "first") {
      if (pin.length !== 4) return setErr("4 dígitos");
      setStep("confirm");
      return;
    }
    if (pin !== pin2) { setErr("No coinciden"); setPin2(""); return; }
    setLoading(true);
    const r = await fetch("/api/parental-pin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setLoading(false);
    if (!r.ok) { setErr("Error guardando"); return; }
    // Auto-verificar para abrir sesión
    await fetch("/api/parental-pin", { method: "PUT", body: JSON.stringify({ pin }) });
    router.push("/parental"); router.refresh();
  }

  const value = mode === "create" && step === "confirm" ? pin2 : pin;
  const setValue = mode === "create" && step === "confirm" ? setPin2 : setPin;

  return (
    <div>
      {mode === "create" && (
        <div className="text-xs font-bold text-ink-soft mb-2">
          {step === "first" ? "Elige 4 dígitos" : "Repítelo para confirmar"}
        </div>
      )}

      <div className="flex justify-center gap-2 mb-3">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center font-fredoka text-2xl font-bold ${
            value.length > i ? "bg-sky border-sky text-white" : "bg-sky-soft border-sky-soft text-ink-mute"
          }`} style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
            {value[i] ? "•" : ""}
          </div>
        ))}
      </div>

      <input ref={inputRef} type="tel" inputMode="numeric" maxLength={4} pattern="\d{4}"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
        className="sr-only"/>
      <button onClick={() => inputRef.current?.focus()} className="text-xs font-bold text-sky underline">
        Toca para escribir
      </button>

      {err && <div className="mt-3 text-pink text-xs font-bold">{err}</div>}

      <button onClick={submit} disabled={loading || value.length !== 4}
        className="btn-chunky mt-4 w-full py-3.5 rounded-2xl bg-sky text-white font-fredoka text-lg font-bold disabled:opacity-50"
        style={{ boxShadow: "0 5px 0 #2445D8" }}>
        {loading ? "..." : mode === "verify" ? "Entrar" : (step === "first" ? "Siguiente" : "Crear PIN")}
      </button>
    </div>
  );
}
