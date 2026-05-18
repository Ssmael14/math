"use client";
// app/admin/audio/AudioAdminClient.tsx
// UI del panel: dos acciones (regenerar faltantes / forzar todo) + resultado.

import { useState } from "react";

type Summary = {
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
};

export function AudioAdminClient({
  total,
  withAudio,
  missingConfig,
}: {
  total: number;
  withAudio: number;
  missingConfig: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missing = total - withAudio;

  async function run(force: boolean) {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/gen-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.detail ? `${json.error}: ${json.detail}` : json.error || "Error");
      } else {
        setResult(json as Summary);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Total" value={total} />
        <Stat label="Con audio" value={withAudio} />
        <Stat label="Faltan" value={missing} />
      </div>

      {missingConfig && (
        <div className="rounded-xl bg-peach-soft border-2 border-pink p-3 text-sm text-ink">
          Falta configurar <code className="font-bold">{missingConfig}</code> en
          el entorno. Sin eso no se puede generar (el botón 🔊 igual funciona
          con la voz del navegador).
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy || !!missingConfig || missing === 0}
          onClick={() => run(false)}
          className="btn-chunky py-2.5 px-5 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm disabled:opacity-40"
          style={{ boxShadow: "0 4px 0 #4DA86A" }}
        >
          {busy ? "Generando…" : `Generar faltantes (${missing})`}
        </button>
        <button
          type="button"
          disabled={busy || !!missingConfig}
          onClick={() => run(true)}
          className="btn-chunky py-2.5 px-5 rounded-full bg-white border-2 border-ink/10 text-ink font-bold text-sm disabled:opacity-40"
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}
        >
          Forzar todo
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-peach-soft border-2 border-pink p-3 text-sm text-ink">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-mint-soft border-2 border-mint p-3 text-sm text-ink space-y-1">
          <div>
            ✓ Generados: <b>{result.generated}</b> · Sin cambios:{" "}
            <b>{result.skipped}</b> · Fallaron: <b>{result.failed}</b>
          </div>
          {result.errors.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-ink-soft">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-2xl bg-white border-2 border-ink/10 py-3"
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      <div className="font-fredoka text-2xl font-bold text-ink">{value}</div>
      <div className="text-[11px] font-bold text-ink-mute uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
