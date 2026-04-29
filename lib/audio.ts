// lib/audio.ts
// Sonidos de feedback + haptic. Sintetizamos los tonos con Web Audio API
// (OscillatorNode) en lugar de cargar archivos mp3 — son cortos, instantáneos
// y no agregan kilobytes al bundle ni latency de red.
//
// Las preferencias del usuario (sonido on/off, haptic on/off) viven en
// localStorage y se respetan por defecto. Los browsers bloquean el AudioContext
// hasta el primer user interaction; lo creamos lazy en el primer play.

const SOUNDS_KEY = "lm_sounds_enabled";
const HAPTICS_KEY = "lm_haptics_enabled";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx) return audioCtx;
  try {
    const Ctor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  freq: number,
  durationMs: number,
  type: OscillatorType = "sine",
  gain = 0.15,
) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  // Envelope rápido para evitar el "click" del corte abrupto.
  g.gain.setValueAtTime(0, now);
  g.gain.linearRampToValueAtTime(gain, now + 0.005);
  g.gain.linearRampToValueAtTime(0, now + durationMs / 1000);
  osc.connect(g).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

function readBoolPref(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    if (v === null) return fallback;
    return v === "1";
  } catch {
    return fallback;
  }
}

export function isSoundsEnabled(): boolean {
  return readBoolPref(SOUNDS_KEY, true);
}

export function isHapticsEnabled(): boolean {
  return readBoolPref(HAPTICS_KEY, true);
}

export function setSoundsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(SOUNDS_KEY, enabled ? "1" : "0"); } catch {}
}

export function setHapticsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(HAPTICS_KEY, enabled ? "1" : "0"); } catch {}
}

/** Vibra el dispositivo si el usuario tiene haptic ON y el browser lo soporta. */
export function vibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  if (!isHapticsEnabled()) return;
  if (typeof navigator.vibrate === "function") {
    try { navigator.vibrate(pattern); } catch { /* noop */ }
  }
}

/** Acorde alegre ascendente (C5 → E5 → G5). */
export function playCorrect() {
  vibrate(20);
  if (!isSoundsEnabled()) return;
  playTone(523.25, 90, "sine", 0.16);
  setTimeout(() => playTone(659.25, 90, "sine", 0.16), 80);
  setTimeout(() => playTone(783.99, 130, "sine", 0.18), 160);
}

/** Tono bajo corto (E3) — claro pero no estridente. */
export function playWrong() {
  vibrate([30, 30, 30]);
  if (!isSoundsEnabled()) return;
  playTone(164.81, 220, "square", 0.09);
}

/** Arpegio mayor para victorias (C-E-G-C alto). */
export function playVictory() {
  vibrate([50, 60, 80]);
  if (!isSoundsEnabled()) return;
  playTone(523.25, 110, "triangle", 0.2);
  setTimeout(() => playTone(659.25, 110, "triangle", 0.2), 110);
  setTimeout(() => playTone(783.99, 110, "triangle", 0.2), 220);
  setTimeout(() => playTone(1046.5, 220, "triangle", 0.22), 330);
}

/** Tap suave para confirmar selección sin mucho drama. */
export function playTap() {
  vibrate(8);
  if (!isSoundsEnabled()) return;
  playTone(880, 40, "sine", 0.08);
}
