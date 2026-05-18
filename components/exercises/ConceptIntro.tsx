"use client";
// components/exercises/ConceptIntro.tsx
// "Momento Lumi" — enseñanza interactiva ANTES de practicar (paso TEACH).
// Pensado para chicos 4-6 que NO leen: cada escena se narra sola (TTS),
// Lumi acompaña, y termina con un "probá vos" imposible de fallar.
//
// No se califica, no descuenta corazones, no suma estrellas. Solo enseña.

import { useEffect, useRef, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { speak, stopSpeaking } from "@/lib/tts";
import { playTap, playCorrect, vibrate } from "@/lib/gamification/audio";
import type { TeachContent } from "@/components/exercises/types";

export function ConceptIntro({
  content,
  onDone,
}: {
  content: TeachContent;
  onDone: () => void;
}) {
  const { beats, tryIt } = content;
  // phase: índice de beat (0..beats.length-1) → luego "try" (si hay) → fin.
  const [beatIdx, setBeatIdx] = useState(0);
  const [phase, setPhase] = useState<"beats" | "try">("beats");
  const [tapped, setTapped] = useState(0);
  const narratedRef = useRef<string>("");

  const beat = beats[beatIdx];
  const isLastBeat = beatIdx >= beats.length - 1;

  // Narra la escena/instrucción actual una sola vez al entrar.
  useEffect(() => {
    const line =
      phase === "beats" ? beat?.text : tryIt?.text;
    if (!line) return;
    const key = `${phase}:${beatIdx}`;
    if (narratedRef.current === key) return;
    narratedRef.current = key;
    void speak(line);
    return () => stopSpeaking();
  }, [phase, beatIdx, beat?.text, tryIt?.text]);

  function nextBeat() {
    playTap();
    if (!isLastBeat) {
      setBeatIdx((n) => n + 1);
      return;
    }
    if (tryIt) {
      setPhase("try");
      return;
    }
    stopSpeaking();
    onDone();
  }

  function onTap() {
    if (!tryIt) return;
    const next = Math.min(tryIt.count, tapped + 1);
    setTapped(next);
    if (next >= tryIt.count) {
      playCorrect();
      vibrate(30);
      stopSpeaking();
      void speak(tryIt.successText);
    } else {
      playTap();
      vibrate(10);
    }
  }

  const tryDone = !!tryIt && tapped >= tryIt.count;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      {/* Cabecera mínima: solo cerrar/avanzar visual de "aprendiendo". */}
      <header className="sticky top-0 z-20 bg-cream/80 backdrop-blur">
        <div className="max-w-2xl mx-auto h-14 flex items-center justify-center">
          <span className="text-xs font-black text-ink-mute tracking-widest uppercase">
            ✨ Aprendamos con Lumi
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        {phase === "beats" && beat && (
          <div key={beatIdx} className="flex flex-col items-center animate-correct-pop">
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mb-6">
              {Array.from({ length: beat.repeat ?? 1 }).map((_, k) => (
                <span
                  key={k}
                  className="text-6xl md:text-7xl drop-shadow-sm"
                  aria-hidden
                >
                  {beat.emoji}
                </span>
              ))}
            </div>
            <p className="font-fredoka text-2xl md:text-4xl font-bold text-ink text-balance max-w-lg">
              {beat.text}
            </p>
          </div>
        )}

        {phase === "try" && tryIt && (
          <div className="flex flex-col items-center">
            <p className="font-fredoka text-xl md:text-3xl font-bold text-ink text-balance max-w-lg mb-6">
              {tryDone ? tryIt.successText : tryIt.text}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 max-w-md">
              {Array.from({ length: tryIt.count }).map((_, k) => {
                const lit = k < tapped;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={onTap}
                    disabled={tryDone}
                    aria-label={`Tocá el ${tryIt.emoji}`}
                    className={`text-6xl md:text-7xl transition-transform active:scale-90 ${
                      lit ? "scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {tryIt.emoji}
                  </button>
                );
              })}
            </div>
            {tryDone && (
              <div className="text-3xl mt-6 animate-correct-pop" aria-hidden>
                🎉⭐🎉
              </div>
            )}
          </div>
        )}
      </main>

      <footer
        className="border-t border-ink/5 bg-white"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 md:py-5 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 flex-1">
            <Lumi size={48} mood={tryDone ? "celebrate" : "happy"} />
            <span className="text-sm font-bold text-ink-soft">
              {phase === "beats"
                ? "Mirá y escuchá a Lumi"
                : tryDone
                ? "¡Lo lograste!"
                : `Tocá los ${tryIt?.emoji}`}
            </span>
          </div>

          {phase === "beats" ? (
            <button
              type="button"
              onClick={nextBeat}
              className="btn-chunky w-full md:w-auto md:min-w-[200px] ml-auto py-3 px-8 rounded-full bg-sky text-white font-black uppercase tracking-wide text-sm"
              style={{ boxShadow: "0 4px 0 #2C8FB8" }}
            >
              {isLastBeat && !tryIt ? "¡Empecemos!" : "Seguir ▶"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!tryDone}
              onClick={() => {
                playTap();
                stopSpeaking();
                onDone();
              }}
              className="btn-chunky w-full md:w-auto md:min-w-[200px] ml-auto py-3 px-8 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm disabled:opacity-40"
              style={{ boxShadow: "0 4px 0 #4DA86A" }}
            >
              ¡Empecemos!
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
