"use client";
// components/exercises/ConceptIntro.tsx
// "Momento Lumi" — enseñanza interactiva ANTES de practicar (paso TEACH).
// Pensado para chicos 4-6 que NO leen: cada escena se narra sola (TTS),
// Lumi acompaña, y termina con un "prueba tú" imposible de fallar.
//
// No se califica, no descuenta corazones, no suma estrellas. Solo enseña.

import { useEffect, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { speak, stopSpeaking } from "@/lib/tts";
import { playTap, playCorrect, vibrate } from "@/lib/gamification/audio";
import { numberWord } from "@/lib/learning/number-words";
import { brand } from "@/lib/brand";
import type { TeachContent } from "@/components/exercises/types";

export function ConceptIntro({
  content,
  onDone,
  variant = "teach",
}: {
  content: TeachContent;
  onDone: () => void;
  /** "reteach" = se vuelve a enseñar tras trabarse (copys más suaves). */
  variant?: "teach" | "reteach";
}) {
  const { beats, tryIt } = content;
  const isReteach = variant === "reteach";
  // phase: índice de beat (0..beats.length-1) → luego "try" (si hay) → fin.
  const [beatIdx, setBeatIdx] = useState(0);
  const [phase, setPhase] = useState<"beats" | "try">("beats");
  const [tapped, setTapped] = useState(0);
  // Cuántos emojis de la escena actual ya aparecieron (conteo animado).
  const [revealed, setRevealed] = useState(1);

  const beat = beats[beatIdx];
  const isLastBeat = beatIdx >= beats.length - 1;

  // Conteo animado con voz: si la escena repite el emoji, aparecen de a uno
  // mientras Lumi cuenta "uno… dos… tres…"; al terminar narra la frase.
  // Si no repite, se muestra y se narra de una. La fase "try" solo narra.
  useEffect(() => {
    if (phase !== "beats") {
      if (tryIt?.text) void speak(tryIt.text);
      return () => stopSpeaking();
    }
    if (!beat) return;
    const total = beat.repeat ?? 1;
    if (total <= 1) {
      setRevealed(total);
      void speak(beat.text);
      return () => stopSpeaking();
    }
    setRevealed(0);
    let n = 0;
    let timer = window.setTimeout(function tick() {
      n += 1;
      setRevealed(n);
      void speak(numberWord(n));
      timer = window.setTimeout(
        n >= total ? () => void speak(beat.text) : tick,
        n >= total ? 900 : 850,
      );
    }, 450);
    return () => {
      window.clearTimeout(timer);
      stopSpeaking();
    };
  }, [phase, beatIdx, beat, tryIt?.text]);

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
            {isReteach
              ? "🔁 Repasemos juntos"
              : `✨ Aprendamos con ${brand.mascotName}`}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        {phase === "beats" && beat && (
          <div key={beatIdx} className="flex flex-col items-center animate-correct-pop">
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mb-6">
              {Array.from({ length: Math.max(1, revealed) }).map((_, k) => (
                <span
                  key={k}
                  className="text-6xl md:text-7xl drop-shadow-sm animate-correct-pop"
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
                    aria-label={`Toca el ${tryIt.emoji}`}
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
                ? `Mira y escucha a ${brand.mascotName}`
                : tryDone
                ? "¡Lo lograste!"
                : `Toca los ${tryIt?.emoji}`}
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
              style={{ boxShadow: "0 4px 0 #1F9E46" }}
            >
              ¡Empecemos!
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
