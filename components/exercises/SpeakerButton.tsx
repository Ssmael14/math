"use client";
// components/exercises/SpeakerButton.tsx
// Botón 🔊 grande para que los chicos que aún no leen escuchen el enunciado.
// Reproduce el audio pre-generado (audioUrl) o cae a la Web Speech API.
// Se auto-reproduce una vez al montar; si el navegador bloquea el autoplay,
// queda el botón para tocar.

import { useEffect, useRef, useState } from "react";
import { speak, stopSpeaking, canSpeak } from "@/lib/tts";

export function SpeakerButton({
  text,
  audioUrl,
  /** Clave que, al cambiar, re-dispara el auto-play (ej: id del ejercicio). */
  autoPlayKey,
}: {
  text: string;
  audioUrl?: string | null;
  autoPlayKey?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  const lastKeyRef = useRef<string | undefined>(undefined);

  async function play() {
    setSpeaking(true);
    await speak(text, audioUrl);
    // Heurística simple: marcamos "hablando" un rato; no hay un evento único
    // confiable entre Audio y speechSynthesis, así que lo soltamos por tiempo.
    const approxMs = Math.min(8000, Math.max(1500, text.length * 70));
    window.setTimeout(() => setSpeaking(false), approxMs);
  }

  // Auto-play al montar / al cambiar de ejercicio.
  useEffect(() => {
    if (autoPlayKey && lastKeyRef.current === autoPlayKey) return;
    lastKeyRef.current = autoPlayKey;
    void play();
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayKey]);

  if (!canSpeak()) return null;

  return (
    <button
      type="button"
      onClick={() => void play()}
      aria-label="Escuchar la consigna"
      className={`shrink-0 grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-sky-soft border-2 border-sky text-2xl md:text-3xl transition-transform active:scale-95 ${
        speaking ? "animate-pulse" : ""
      }`}
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      🔊
    </button>
  );
}
