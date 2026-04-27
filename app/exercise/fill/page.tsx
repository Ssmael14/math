"use client";
import Link from "next/link";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Lumi } from "@/components/Lumi";

export default function FillBlankExercise() {
  const [sel, setSel] = useState<number | null>(3);
  const correct = 3;

  return (
    <PhoneFrame bg="#FFF9F0">
      <div className="flex flex-col h-full pt-14 pb-5 px-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-bold" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>✕</Link>
          <div className="flex-1 h-3.5 bg-lilac-soft rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-mint rounded-full"/>
          </div>
          <span className="text-sm font-bold text-pink">❤️ 5</span>
        </div>

        <div className="text-center mt-3">
          <div className="flex justify-center"><Lumi size={80}/></div>
          <div className="text-[10px] font-black text-pink tracking-widest">🧩 LLENÁ EL HUECO</div>
          <div className="font-fredoka text-base font-bold text-ink">¿Qué número falta?</div>
        </div>

        <div className="flex items-center justify-center gap-2.5 mt-3 font-fredoka text-5xl font-bold text-ink">
          <span>2</span>
          <span className="text-pink">+</span>
          <div className="w-[70px] h-[84px] rounded-2xl border-4 border-dashed border-sun flex items-center justify-center animate-pulse-soft" style={{ background: sel ? "#FFF5D6" : "white" }}>
            {sel ?? "?"}
          </div>
          <span className="text-pink">=</span>
          <span>5</span>
        </div>

        <div className="flex-1"/>

        <div>
          <div className="text-[11px] font-black text-ink-soft tracking-wide mb-2 text-center">TOCÁ UN NÚMERO</div>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1,2,3,4,5,6,7,8].map(n => {
              const isSel = sel === n;
              return (
                <button key={n} onClick={() => setSel(n)} className={`btn-chunky py-3.5 rounded-2xl font-fredoka text-xl font-bold ${
                  isSel ? "bg-sun border-[3px] border-sun-deep" : "bg-white border-[3px] border-white"
                } text-ink`} style={{ boxShadow: "var(--shadow-chunky)" }}>{n}</button>
              );
            })}
          </div>
          <Link href={sel === correct ? "/victory" : "/game-over"} className="btn-chunky block text-center py-3.5 rounded-2xl bg-mint text-white font-black text-sm tracking-wider uppercase" style={{ boxShadow: "0 5px 0 #4DA86A" }}>
            Comprobar
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
