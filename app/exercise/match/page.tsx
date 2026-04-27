"use client";
import Link from "next/link";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";

export default function MatchExercise() {
  const [matches, setMatches] = useState<Record<number, number>>({ 0: 2, 2: 1 });
  const left = [{ v: "🍎🍎🍎" }, { v: "🐟🐟🐟🐟🐟" }, { v: "⭐⭐" }];
  const right = [5, 3, 2];

  return (
    <PhoneFrame bg="#FFF9F0">
      <div className="flex flex-col h-full pt-14 pb-5 px-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-bold" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>✕</Link>
          <div className="flex-1 h-3.5 bg-lilac-soft rounded-full overflow-hidden">
            <div className="h-full w-[55%] bg-mint rounded-full"/>
          </div>
          <span className="text-sm font-bold text-pink">❤️ 4</span>
        </div>
        <div className="text-center mt-3">
          <div className="text-[10px] font-black text-sun-deep tracking-widest">🔗 UNIR CON LÍNEAS</div>
          <div className="font-fredoka text-lg font-bold text-ink mt-0.5">Conectá cada grupo con su número</div>
        </div>

        <div className="flex-1 relative mt-4">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {Object.entries(matches).map(([l, r]) => {
              const y1 = 40 + +l * 90;
              const y2 = 40 + r * 90;
              return <path key={l} d={`M 120 ${y1} Q 170 ${(y1+y2)/2}, 220 ${y2}`} stroke="#FFC94A" strokeWidth="5" fill="none" strokeLinecap="round"/>;
            })}
          </svg>
          <div className="flex justify-between relative z-0">
            <div className="flex flex-col gap-4">
              {left.map((it, i) => (
                <div key={i} className="w-[120px] h-[74px] bg-white rounded-2xl flex items-center justify-center text-lg tracking-tighter border-[3px] border-white" style={{ boxShadow: "var(--shadow-chunky)" }}>
                  {it.v}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {right.map((n, i) => (
                <div key={i} className="w-[74px] h-[74px] bg-sun-soft rounded-2xl flex items-center justify-center font-fredoka text-3xl font-bold text-ink border-[3px] border-sun" style={{ boxShadow: "0 4px 0 #E8A500" }}>
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Link href="/victory" className="btn-chunky py-3.5 rounded-2xl bg-mint text-white text-center font-black text-sm tracking-wider uppercase" style={{ boxShadow: "0 5px 0 #4DA86A" }}>
          Comprobar
        </Link>
      </div>
    </PhoneFrame>
  );
}
