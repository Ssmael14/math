"use client";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BackButton } from "@/components/BackButton";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";

/** Drag & drop 🐟: 3 + 2 pescados */
export default function DragExercise() {
  const [variant] = useLumiVariant();
  const [inBasket, setInBasket] = useState(0);
  const target = 5;
  const state = inBasket === target ? "correct" : "idle";

  return (
    <PhoneFrame>
      <div className="w-full h-full flex flex-col bg-cream">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <BackButton href="/home" />
          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full" style={{ width: "40%" }} />
          </div>
        </div>

        <h2 className="font-fredoka text-lg font-bold text-ink px-6 mt-2">
          Arrastra 5 peces a la cesta 🧺
        </h2>

        {/* Estanque */}
        <div className="mx-4 mt-3 bg-sky-soft rounded-3xl p-4 border-2 border-white" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="text-xs font-extrabold text-ink-soft mb-1">ESTANQUE</div>
          <div className="grid grid-cols-4 gap-2 min-h-16">
            {Array.from({ length: 8 - inBasket }).map((_, i) => (
              <button
                key={i}
                onClick={() => inBasket < 8 && setInBasket(inBasket + 1)}
                className="text-3xl hover:scale-110 transition-transform cursor-grab active:cursor-grabbing"
              >
                🐟
              </button>
            ))}
          </div>
        </div>

        {/* Cesta */}
        <div className="mx-4 mt-4 flex-1 bg-peach-soft rounded-3xl p-4 border-2 border-white flex flex-col" style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-ink-soft">CESTA</div>
            <div className="font-fredoka text-sm font-bold text-ink">{inBasket} / {target}</div>
          </div>
          <div className="grid grid-cols-4 gap-2 flex-1 content-start mt-2">
            {Array.from({ length: inBasket }).map((_, i) => (
              <button
                key={i}
                onClick={() => setInBasket(inBasket - 1)}
                className="text-3xl"
              >
                🐟
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 mt-3">
          <Lumi variant={variant} size={60} />
          <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-sm font-bold text-ink-soft" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
            {state === "correct" ? "¡Lo lograste! 🎉" : "Tocá un pez para moverlo"}
          </div>
        </div>

        <div className="p-4">
          <button
            disabled={state !== "correct"}
            className={`btn-chunky w-full py-4 rounded-2xl font-black uppercase tracking-wide ${state === "correct" ? "bg-mint text-white" : "bg-ink-mute/30 text-white"}`}
            style={{ boxShadow: state === "correct" ? "0 5px 0 #4DA86A" : "none" }}
          >
            Continuar
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
