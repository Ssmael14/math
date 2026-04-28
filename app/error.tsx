"use client";
// Boundary global de errores no capturados en cualquier ruta del App Router.
// Next renderiza este componente en lugar de mostrar la pantalla en blanco.
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Cuando enchufemos analytics (PostHog/Sentry), reportar acá.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 bg-cream text-center">
      <div className="text-7xl mb-4">🦙</div>
      <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mb-2">
        Lumi se tropezó
      </h1>
      <p className="text-ink-soft max-w-sm mb-6">
        Algo salió mal. Probá de nuevo en un ratito — los datos están a salvo.
      </p>
      <button
        onClick={() => reset()}
        className="btn-chunky py-3 px-8 rounded-full bg-ink text-white font-black uppercase tracking-wide text-sm"
        style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.25)" }}
      >
        Reintentar
      </button>
      {error.digest ? (
        <div className="mt-6 text-[10px] font-mono text-ink-mute opacity-60">
          ref: {error.digest}
        </div>
      ) : null}
    </div>
  );
}
