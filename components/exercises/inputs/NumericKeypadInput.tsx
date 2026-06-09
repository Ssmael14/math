"use client";
// components/exercises/inputs/NumericKeypadInput.tsx
// Teclado numérico tipo Brilliant: el niño tipea un número entre 0 y N (típico
// 0-20). Al tocar cada tecla actualiza el display; con ⌫ borra el último
// dígito y con ✓ confirma. Pensado para reemplazar las opciones predecibles
// de FILL (donde 4 botones cercanos a la respuesta hacen que se adivine).

import { useState } from "react";
import { playTap } from "@/lib/gamification/audio";

export function NumericKeypadInput({
  max = 20,
  disabled = false,
  onSubmit,
}: {
  /** Cota superior — afecta cuántos dígitos puede tipear (1 si max <=9, 2 si no). */
  max?: number;
  disabled?: boolean;
  onSubmit: (value: number) => void;
}) {
  const [text, setText] = useState("");
  const maxLen = max <= 9 ? 1 : 2;

  function press(d: string) {
    if (disabled) return;
    if (text.length >= maxLen) return;
    playTap();
    // No permitir leading zero salvo que sea el único dígito
    if (text === "" && d === "0") {
      setText("0");
      return;
    }
    setText(text + d);
  }

  function backspace() {
    if (disabled) return;
    playTap();
    setText(text.slice(0, -1));
  }

  function confirm() {
    if (disabled) return;
    if (text === "") return;
    // El sonido de "correct/wrong" lo dispara el runner cuando evalúa,
    // así que aquí no agregamos un tap extra para evitar doble feedback.
    onSubmit(parseInt(text, 10));
  }

  const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "✓"];

  return (
    <div className="w-full max-w-xs flex flex-col items-center gap-3">
      {/* Display */}
      <div
        className="w-full h-16 rounded-2xl bg-cream border-2 border-ink/10 flex items-center justify-center font-fredoka text-4xl font-bold text-ink"
        aria-live="polite"
        aria-label={`Respuesta: ${text || "vacía"}`}
      >
        {text || <span className="text-ink-mute">?</span>}
      </div>

      {/* Keypad 3x4 */}
      <div className="w-full grid grid-cols-3 gap-2">
        {KEYS.map((k) => {
          const isAction = k === "⌫" || k === "✓";
          const onClick = k === "⌫" ? backspace : k === "✓" ? confirm : () => press(k);
          const enabled =
            !disabled &&
            (k === "✓" ? text.length > 0 :
             k === "⌫" ? text.length > 0 :
             text.length < maxLen);
          return (
            <button
              key={k}
              type="button"
              onClick={onClick}
              disabled={!enabled}
              aria-label={k === "⌫" ? "Borrar" : k === "✓" ? "Confirmar respuesta" : `Tecla ${k}`}
              className={`btn-chunky py-4 rounded-2xl border-2 font-fredoka text-2xl font-bold transition-colors ${
                k === "✓" ? "bg-mint text-white border-mint" :
                k === "⌫" ? "bg-peach-soft text-ink border-pink/40" :
                "bg-white text-ink border-ink/10 hover:border-ink/30"
              } disabled:opacity-40`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              {k}
            </button>
          );
        })}
      </div>
    </div>
  );
}
