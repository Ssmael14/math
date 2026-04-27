"use client";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BackButton } from "@/components/BackButton";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";

/** Contar estrellas: 7 ⭐, teclado numérico */
export default function CountExercise() {
  const [variant] = useLumiVariant();
  const [input, setInput] = useState("");
  const total = 7;
  const isCorrect = input !== "" && parseInt(input, 10) === total;
  const isWrong = input !== "" && parseInt(input, 10) !== total;

  const type = (n: string) => {
    if (input.length < 2) setInput(input + n);
  };
  const erase = () => setInput(input.slice(0, -1));

  return (
    <PhoneFrame>
      <div className="w-full h-full flex flex-col bg-cream">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <BackButton href="/home" />
          <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-mint rounded-full" style={{ width: "70%" }} />
          </div>
        </div>

        <h2 className="font-fredoka text-lg font-bold text-ink px-6 mt-2">
          ¿Cuántas estrellas hay?
        </h2>

        <div className="mx-4 mt-4 rounded-3xl p-5 border-2 border-white" style={{ background: "linear-gradient(180deg, #FFE5A3 0%, #FFC94A 100%)", boxShadow: "var(--shadow-chunky)" }}>
          <div className="flex flex-wrap gap-2 justify-center">
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className="text-4xl animate-bob" style={{ animationDelay: `${i * 0.1}s` }}>⭐</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 mt-4">
          <Lumi variant={variant} size={60} />
          <div
            className={`flex-1 h-14 rounded-2xl bg-white border-[3px] flex items-center justify-center font-fredoka text-3xl font-bold ${
              isCorrect ? "border-mint text-mint" : isWrong ? "border-pink text-pink" : "border-white text-ink"
            }`}
            style={{ boxShadow: "var(--shadow-chunky-sm)" }}
          >
            {input || "?"}
          </div>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 p-4">
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => {
            if (k === "") return <div key={i} />;
            return (
              <button
                key={i}
                onClick={() => k === "⌫" ? erase() : type(k)}
                className="btn-chunky py-3.5 rounded-2xl bg-white font-fredoka text-2xl font-bold text-ink border-2 border-white"
                style={{ boxShadow: "var(--shadow-chunky-sm)" }}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
