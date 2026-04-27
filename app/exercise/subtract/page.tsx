"use client";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BackButton } from "@/components/BackButton";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";

/** 6 - 2 = ? con cupcakes tachados */
export default function SubtractionExercise() {
  const [variant] = useLumiVariant();
  const [eaten, setEaten] = useState<number[]>([]);
  const total = 6;
  const toEat = 2;
  const correct = total - toEat;

  const toggle = (i: number) => {
    setEaten((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));
  };

  const ready = eaten.length === toEat;

  return (
    <PhoneFrame>
      <div className="w-full h-full flex flex-col bg-cream">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <BackButton href="/home" />
          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full" style={{ width: "55%" }} />
          </div>
        </div>

        <h2 className="font-fredoka text-lg font-bold text-ink px-6 mt-2">
          Lumi se come 2 pastelitos. ¿Cuántos quedan?
        </h2>

        <div className="mx-4 mt-4 bg-white rounded-3xl p-4 border-2 border-white grid grid-cols-3 gap-3" style={{ boxShadow: "var(--shadow-chunky)" }}>
          {Array.from({ length: total }).map((_, i) => {
            const gone = eaten.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`text-5xl py-2 rounded-xl transition-all ${gone ? "opacity-20 grayscale" : "bg-peach-soft"}`}
              >
                {gone ? "✗" : "🧁"}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 px-4 mt-3">
          <Lumi variant={variant} size={70} mood="celebrate" />
          <div className="flex-1 bg-white rounded-2xl px-3 py-2 text-sm font-bold text-ink-soft" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
            Tocá los que se come Lumi 😋
          </div>
        </div>

        <div className="mt-auto px-6 pb-2 text-center">
          <div className="font-fredoka text-3xl font-bold text-ink-soft">
            6 − 2 = <span className="text-pink">{ready ? correct : "?"}</span>
          </div>
        </div>

        <div className="p-4">
          <button
            disabled={!ready}
            className={`btn-chunky w-full py-4 rounded-2xl font-black uppercase tracking-wide ${ready ? "bg-mint text-white" : "bg-ink-mute/30 text-white"}`}
            style={{ boxShadow: ready ? "0 5px 0 #4DA86A" : "none" }}
          >
            Comprobar
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
