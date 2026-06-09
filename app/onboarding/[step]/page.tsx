"use client";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";
import { brand } from "@/lib/brand";

const slides = [
  { title: `¡Hola! Soy ${brand.mascotName}`, sub: "Vamos a jugar con los números juntos", bg: "linear-gradient(180deg, #EAF0FF 0%, #FFFFFF 100%)", cta: "Empezar" },
  { title: "Aprender jugando", sub: "Suma, resta y cuenta con animalitos, frutas y estrellas", bg: "linear-gradient(180deg, #EEF0FF 0%, #EAF0FF 100%)", cta: "Siguiente" },
  { title: "Gana recompensas", sub: `Colecciona gemas, medallas y accesorios para ${brand.mascotName}`, bg: "linear-gradient(180deg, #EAF0FF 0%, #FFF5D6 100%)", cta: "¡A jugar!" },
];

export default function OnboardingPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = use(params);
  const router = useRouter();
  const [variant] = useLumiVariant();
  const idx = Math.max(0, Math.min(2, parseInt(step, 10) - 1));
  const slide = slides[idx];

  const next = () => {
    if (idx < 2) router.push(`/onboarding/${idx + 2}`);
    else router.push("/home");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: slide.bg }}>
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col items-center justify-between px-8 pt-16 pb-10 md:py-16">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className="h-2 rounded-full transition-all" style={{ width: i === idx ? 24 : 8, background: i === idx ? "#4867F5" : "rgba(72,103,245,0.22)" }}/>
          ))}
        </div>
        <div className="flex flex-col items-center text-center">
          <Lumi variant={variant} size={180} mood="celebrate"/>
          <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mt-6 text-balance">{slide.title}</h1>
          <p className="text-ink-soft font-bold mt-2 text-pretty">{slide.sub}</p>
        </div>
        <button onClick={next} className="btn-chunky w-full py-4 rounded-2xl bg-sky text-white font-black uppercase tracking-wide" style={{ boxShadow: "0 5px 0 #2445D8" }}>
          {slide.cta}
        </button>
      </main>
    </div>
  );
}
