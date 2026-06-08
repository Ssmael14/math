"use client";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";
import { brand } from "@/lib/brand";

export default function LevelUpPage() {
  const router = useRouter();
  const [variant] = useLumiVariant();

  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center p-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #4867F5 0%, #7C6CFF 62%, #102042 100%)" }}>
      <svg viewBox="0 0 300 600" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = ((i * 360) / 14) * (Math.PI / 180);
          return <line key={i} x1="150" y1="300" x2={150 + Math.cos(angle) * 500} y2={300 + Math.sin(angle) * 500} stroke="white" strokeWidth="30"/>;
        })}
      </svg>
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="font-fredoka text-lg font-semibold tracking-[3px] text-white drop-shadow">¡SUBISTE DE NIVEL!</div>
        <div className="mx-auto mt-4 w-44 h-44 rounded-full flex items-center justify-center relative animate-pulse-soft" style={{ background: "radial-gradient(circle, #FFF5D6 0%, #FFC94A 70%, #D99A00 100%)", border: "8px solid white", boxShadow: "0 8px 0 #102042, 0 0 40px rgba(255,255,255,0.8)" }}>
          <span className="font-fredoka text-7xl font-bold text-ink leading-none">5</span>
          <span className="absolute -top-1 right-5 text-2xl">⭐</span>
        </div>
        <div className="font-fredoka text-2xl font-bold text-white mt-3 drop-shadow">Explorador 🌟</div>
        <p className="text-white/90 font-bold text-sm mt-1 px-4">Desbloqueaste <b>Restas hasta 20</b> y un sombrero nuevo para {brand.mascotName}.</p>
        <div className="grid grid-cols-2 gap-3 mt-5">
          {[{ icon: "📖", title: "Nueva unidad", sub: "Restas hasta 20" }, { icon: "🎩", title: "Sombrero", sub: "Gratis para ti" }].map((c) => (
            <div key={c.title} className="bg-white/95 rounded-2xl p-3 border-2 border-white text-center" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <div className="text-3xl">{c.icon}</div>
              <div className="font-fredoka font-bold text-ink text-sm">{c.title}</div>
              <div className="text-[10px] font-bold text-ink-soft">{c.sub}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-5 opacity-90"><Lumi variant={variant} size={110} mood="celebrate"/></div>
        <button onClick={() => router.push("/home")} className="btn-chunky mt-5 w-full py-4 rounded-2xl bg-white text-ink font-black uppercase tracking-wide" style={{ boxShadow: "0 5px 0 #102042" }}>¡Seguir!</button>
      </div>
    </div>
  );
}
