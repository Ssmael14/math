"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Confetti } from "@/components/Confetti";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";
import { playVictory } from "@/lib/audio";
import { useCountUp } from "@/lib/use-count-up";

export function VictoryView({
  xp,
  stars,
  continueHref = "/home",
}: {
  xp: number;
  stars: number;
  /** Adónde vuelve el niño al apretar Continuar (típicamente al mapa de la
   *  unidad que estaba jugando). */
  continueHref?: string;
}) {
  const router = useRouter();
  // Anima el XP de 0 al valor real durante ~900ms.
  const animatedXp = useCountUp(xp, 900);

  // Pequeño delay para que el sonido entre justo cuando aparece la animación.
  useEffect(() => {
    const t = setTimeout(() => playVictory(), 120);
    return () => clearTimeout(t);
  }, []);
  const [variant] = useLumiVariant();
  const accuracyPct = Math.round((stars / 3) * 100);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #FFE5A3 0%, #FFC9D9 100%)" }}
    >
      <Confetti/>

      {/* Rayos decorativos */}
      <svg viewBox="0 0 300 600" className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = ((i * 360) / 12) * (Math.PI / 180);
          const x2 = 150 + Math.cos(angle) * 500;
          const y2 = 300 + Math.sin(angle) * 500;
          return <line key={i} x1="150" y1="300" x2={x2} y2={y2} stroke="white" strokeWidth="28"/>;
        })}
      </svg>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6 md:gap-8">
        <div className="text-center">
          <div className="font-fredoka text-sm font-semibold tracking-widest text-ink/70">¡LECCIÓN COMPLETA!</div>
          <h1 className="font-fredoka text-5xl md:text-6xl font-bold text-ink mt-1">¡Genial! 🎉</h1>
        </div>

        <div className="animate-bob">
          <Lumi variant={variant} size={180} mood="celebrate"/>
        </div>

        <div className="w-full grid grid-cols-3 gap-2">
          {[
            { icon: "⭐", value: `+${animatedXp}`, label: "XP" },
            { icon: "🌟", value: `${stars}/3`, label: "Estrellas" },
            { icon: "🎯", value: `${accuracyPct}%`, label: "Precisión" },
          ].map((s) => (
            <div key={s.label} className="bg-white/95 rounded-2xl p-3 text-center border-2 border-white" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <div className="text-2xl">{s.icon}</div>
              <div className="font-fredoka font-bold text-ink">{s.value}</div>
              <div className="text-[10px] font-extrabold text-ink-soft uppercase">{s.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push(continueHref)}
          className="btn-chunky w-full py-4 rounded-2xl bg-ink text-white font-black uppercase tracking-wide"
          style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.25)" }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
