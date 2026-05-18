// lib/tts/index.ts
// Text-to-speech para pre-lectores (chicos 4-6 que aún no leen).
//
// Estrategia en dos capas, sin costo en runtime:
//   1) Si el ejercicio tiene `audioUrl` (mp3 pre-generado con ElevenLabs por
//      `npm run gen:audio`), se reproduce ese archivo. Es lo ideal: voz
//      cálida, consistente ("Lumi"), funciona offline si está cacheado.
//   2) Si no hay audioUrl, fallback gratis con la Web Speech API del navegador
//      (`speechSynthesis`). Voz robótica pero suficiente para no bloquear.
//
// Todo es client-only y degrada en silencio si el navegador no soporta nada
// (nunca tira). La fase B agrega la generación batch real con ElevenLabs.

let currentAudio: HTMLAudioElement | null = null;

function stopAll() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function pickSpanishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Preferencia: español latino → cualquier español → la default.
  return (
    voices.find((v) => /es[-_](419|MX|US|AR|CO)/i.test(v.lang)) ??
    voices.find((v) => v.lang.toLowerCase().startsWith("es")) ??
    null
  );
}

function speakWithWebSpeech(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  u.rate = 0.9; // un toque más lento para chicos
  u.pitch = 1.1;
  const apply = () => {
    const v = pickSpanishVoice();
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  };
  // Las voces a veces cargan async la primera vez.
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", apply, { once: true });
    // Fallback por si el evento nunca llega.
    setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) window.speechSynthesis.speak(u);
    }, 250);
  } else {
    apply();
  }
}

/**
 * Lee `text` en voz alta. Si hay `audioUrl`, reproduce ese mp3; si no, usa la
 * Web Speech API. Devuelve una promesa que resuelve cuando empezó (o cuando
 * se decidió que no se puede reproducir). Nunca rechaza.
 */
export async function speak(
  text: string,
  audioUrl?: string | null,
): Promise<void> {
  if (typeof window === "undefined") return;
  stopAll();

  if (audioUrl) {
    try {
      const a = new Audio(audioUrl);
      currentAudio = a;
      a.addEventListener("ended", () => {
        if (currentAudio === a) currentAudio = null;
      });
      await a.play();
      return;
    } catch {
      // El navegador bloqueó autoplay o el archivo falló: caemos al fallback.
      currentAudio = null;
    }
  }

  if (text.trim()) speakWithWebSpeech(text);
}

/** Corta cualquier reproducción en curso (al cambiar de ejercicio, etc.). */
export function stopSpeaking() {
  stopAll();
}

/** ¿El navegador puede hablar de alguna forma? (para ocultar el botón si no). */
export function canSpeak(): boolean {
  if (typeof window === "undefined") return false;
  return "speechSynthesis" in window || typeof Audio !== "undefined";
}
