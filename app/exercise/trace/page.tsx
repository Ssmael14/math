"use client";
import Link from "next/link";
import { PhoneFrame } from "@/components/PhoneFrame";

export default function TraceExercise() {
  return (
    <PhoneFrame bg="#FFF9F0">
      <div className="flex flex-col h-full pt-14 pb-5 px-4">
        <div className="flex items-center gap-2">
          <Link href="/home" className="w-8 h-8 bg-white rounded-xl flex items-center justify-center font-bold" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>✕</Link>
          <div className="flex-1 h-3.5 bg-lilac-soft rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-mint rounded-full"/>
          </div>
          <span className="text-sm font-bold text-pink">❤️ 5</span>
        </div>

        <div className="text-center mt-4">
          <div className="text-[10px] font-black text-ink-soft tracking-widest">✍️ APRENDÉ A ESCRIBIR</div>
          <div className="font-fredoka text-xl font-bold text-ink mt-0.5">
            Trazá el número <span className="text-sun">cinco</span>
          </div>
          <div className="text-xs font-bold text-ink-soft">Seguí la flecha con el dedo</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full aspect-square max-w-[300px] bg-white rounded-3xl border-[3px] border-white flex items-center justify-center" style={{ boxShadow: "0 4px 0 rgba(61,46,79,0.1)" }}>
            <svg width="90%" height="90%" viewBox="0 0 200 250">
              <defs>
                <pattern id="dots" width="25" height="25" patternUnits="userSpaceOnUse">
                  <circle cx="12" cy="12" r="1" fill="#E5DFED"/>
                </pattern>
              </defs>
              <rect width="200" height="250" fill="url(#dots)"/>
              <path d="M 130 35 L 70 35 L 65 110 Q 90 90, 120 100 Q 150 115, 145 160 Q 140 210, 80 210 Q 55 210, 45 190"
                fill="none" stroke="#F0EBF5" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 130 35 L 70 35 L 66 85"
                fill="none" stroke="#FFC94A" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="130" cy="35" r="8" fill="#68C886"/>
              <text x="130" y="38" fontSize="9" fontWeight="900" fill="white" textAnchor="middle">1</text>
            </svg>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button className="btn-chunky flex-1 py-3.5 rounded-2xl bg-white text-ink border-2 border-lilac-soft font-black text-xs" style={{ boxShadow: "0 4px 0 #BFB4CC" }}>↺ Reiniciar</button>
          <Link href="/victory" className="btn-chunky flex-[2] py-3.5 rounded-2xl bg-sun text-ink text-center font-black text-sm tracking-wider uppercase" style={{ boxShadow: "0 4px 0 #E8A500" }}>
            Escuchar "cinco" 🔊
          </Link>
        </div>
      </div>
    </PhoneFrame>
  );
}
