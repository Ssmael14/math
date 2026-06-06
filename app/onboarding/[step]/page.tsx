"use client";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";
import { brand } from "@/lib/brand";

const slides = [
  { title: `¡Hola! Soy ${brand.mascotName}`, sub: "Vamos a jugar con los números juntos", bg: "linear-gradient(180deg, #FFE5A3 0%, #FFC9D9 100%)", cta: "Empezar" },
  { title: "Aprender jugando", sub: "Sumá, restá y contá con animalitos, frutas y estrellas", bg: "linear-gradient(180deg, #B8E0F5 0%, #DDC9F0 100%)", cta: "Siguiente" },
  { title: "Ganá recompensas", sub: `Coleccioná gemas, medallas y accesorios para ${brand.mascotName}`, bg: "linear-gradient(180deg, #C5EED0 0%, #FFE5A3 100%)", cta: "¡A jugar!" },
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
            <div key={i} className="h-2 rounded-full transition-all" style={{ width: i === idx ? 24 : 8, background: i === idx ? "#3D2E4F" : "rgba(61,46,79,0.25)" }}/>
          ))}
        </div>
        <div className="flex flex-col items-center text-center">
          <Lumi variant={variant} size={180} mood="celebrate"/>
          <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mt-6 text-balance">{slide.title}</h1>
          <p className="text-ink-soft font-bold mt-2 text-pretty">{slide.sub}</p>
        </div>
        <button onClick={next} className="btn-chunky w-full py-4 rounded-2xl bg-ink text-white font-black uppercase tracking-wide" style={{ boxShadow: "0 5px 0 rgba(0,0,0,0.25)" }}>
          {slide.cta}
        </button>
      </main>
    </div>
  );
}
