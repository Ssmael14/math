"use client";
// Boundary específico del runner de lecciones — si algo revienta a mitad
// de un ejercicio mostramos un mensaje amable y un botón para volver al home
// (en vez de perder al niño en una página rota).
import { useEffect } from "react";
import Link from "next/link";
import { brand } from "@/lib/brand";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LessonError]", error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 bg-white text-center">
      <img src={brand.assets.mascotSad} alt="" className="mb-4 h-28 w-28" />
      <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink mb-2">
        Esta lección se cayó
      </h1>
      <p className="text-ink-soft max-w-sm mb-6">
        Prueba reintentar o vuelve al inicio. Tu progreso anterior está guardado.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="btn-chunky py-3 px-6 rounded-full bg-sky text-white font-black uppercase tracking-wide text-sm"
          style={{ boxShadow: "0 4px 0 #2445D8" }}
        >
          Reintentar
        </button>
        <Link
          href="/home"
          className="btn-chunky py-3 px-6 rounded-full bg-white border-2 border-ink/10 text-ink font-black uppercase tracking-wide text-sm"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
