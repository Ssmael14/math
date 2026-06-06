"use client";
// Wrapper de "Repaso del día" sobre el ExerciseRunner compartido. No registra
// progreso de lección ni descuenta corazones — sólo deja que el SRS actualice
// la mastery y al terminar manda al niño a una pantalla corta de cierre.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Confetti } from "@/components/Confetti";
import { playTap, playVictory } from "@/lib/gamification/audio";
import { Lumi } from "@/components/Lumi";
import { brand } from "@/lib/brand";
import { ExerciseRunner } from "@/components/exercises/ExerciseRunner";
import type { ExerciseDTO } from "@/components/exercises/types";

export function ReviewRunner({
  childId,
  hearts,
  exercises,
}: {
  childId: string;
  hearts: number;
  exercises: ExerciseDTO[];
}) {
  const router = useRouter();
  const [done, setDone] = useState<{ correctCount: number; total: number } | null>(null);

  if (done) {
    return <ReviewDoneScreen correct={done.correctCount} total={done.total} onContinue={() => { playTap(); router.push("/home"); }}/>;
  }

  return (
    <ExerciseRunner
      childId={childId}
      hearts={hearts}
      exercises={exercises}
      reviewMode
      labels={{ step: "REPASO", idle: "Refrescá lo que ya viste — sin presión." }}
      onComplete={async (result) => {
        setDone(result);
      }}
    />
  );
}

function ReviewDoneScreen({
  correct, total, onContinue,
}: { correct: number; total: number; onContinue: () => void }) {
  const pct = Math.round((correct / Math.max(1, total)) * 100);
  useEffect(() => {
    const t = setTimeout(() => playVictory(), 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #E5DFED 0%, #FFE5A3 100%)" }}
    >
      <Confetti/>
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-center">
          <div className="font-fredoka text-sm font-semibold tracking-widest text-ink/70">¡REPASO COMPLETO!</div>
          <h1 className="font-fredoka text-4xl md:text-5xl font-bold text-ink mt-1">{brand.mascotName} está orgulloso</h1>
        </div>

        <div className="animate-bob">
          <Lumi size={160} mood="celebrate"/>
        </div>

        <div className="w-full grid grid-cols-2 gap-2">
          <div className="bg-white/95 rounded-2xl p-3 text-center border-2 border-white" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
            <div className="text-2xl">✅</div>
            <div className="font-fredoka font-bold text-ink">{correct}/{total}</div>
            <div className="text-[10px] font-extrabold text-ink-soft uppercase">Correctos</div>
          </div>
          <div className="bg-white/95 rounded-2xl p-3 text-center border-2 border-white" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
            <div className="text-2xl">🎯</div>
            <div className="font-fredoka font-bold text-ink">{pct}%</div>
            <div className="text-[10px] font-extrabold text-ink-soft uppercase">Precisión</div>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="btn-chunky w-full py-4 rounded-2xl bg-ink text-white font-black uppercase tracking-wide"
          style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.25)" }}
        >
          Volver al inicio
        </button>
        <Link href="/profile" className="text-xs font-bold text-ink-soft underline">Ver mi progreso</Link>
      </div>
    </div>
  );
}
