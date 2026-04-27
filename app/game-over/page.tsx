"use client";
import { useRouter } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";

export default function GameOverPage() {
  const router = useRouter();
  const [variant] = useLumiVariant();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-peach-soft to-lilac-soft">
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-between px-6 pt-16 pb-10 md:py-16 gap-6">
        <div className="text-center">
          <div className="font-fredoka text-sm font-semibold tracking-widest text-ink/60">SIN CORAZONES</div>
          <h1 className="font-fredoka text-4xl md:text-5xl font-bold text-ink mt-1">Te quedaste sin vidas</h1>
        </div>
        <div className="relative">
          <Lumi variant={variant} size={180} mood="sad" animate={false}/>
          <div className="absolute top-14 right-8 text-3xl animate-bob">💧</div>
        </div>
        <div className="w-full bg-white rounded-2xl p-4 border-2 border-white text-center" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="font-fredoka font-bold text-ink">Próxima vida en</div>
          <div className="font-fredoka text-3xl font-bold text-pink mt-1">23:45</div>
        </div>
        <div className="w-full flex flex-col gap-3">
          <button onClick={() => router.push("/home")} className="btn-chunky w-full py-4 rounded-2xl bg-sun text-ink font-black uppercase tracking-wide flex items-center justify-center gap-2" style={{ boxShadow: "0 5px 0 #E8A500" }}>
            <span>💎</span> Comprar corazón · 10
          </button>
          <button onClick={() => router.push("/home")} className="btn-chunky w-full py-4 rounded-2xl bg-white text-ink font-black uppercase tracking-wide border-2 border-ink/10" style={{ boxShadow: "0 4px 0 rgba(61,46,79,0.15)" }}>
            Volver al mapa
          </button>
        </div>
      </main>
    </div>
  );
}
