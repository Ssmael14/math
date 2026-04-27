"use client";
import { useEffect, useState } from "react";

interface FrameProps {
  children: React.ReactNode;
  bg?: string;
}

/**
 * PhoneFrame responsive — estilo Brilliant.
 *
 * MOBILE (< 768px):
 *   La app ocupa 100% del viewport. Sin marco decorativo.
 *   Respeta notch / home indicator.
 *
 * DESKTOP (>= 768px):
 *   Layout WEB amplio — NO mostramos un mockup de celular.
 *   El contenido se extiende horizontalmente con un contenedor max-w-4xl centrado.
 *   Así se ve como una app web de verdad (Brilliant, Duolingo web).
 *
 * El contenido hijo tiene que estar diseñado responsive: lo que era un "h-full" del
 * celular ahora se estira al viewport. Dentro, usar contenedores con max-width para
 * controlar la densidad.
 */
export function PhoneFrame({ children, bg = "#FFF9F0" }: FrameProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // En SSR y en mobile, wrapper simple full-screen
  return (
    <div
      className="w-full min-h-[100dvh]"
      style={{
        background: bg,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="
          relative w-full min-h-[100dvh] mx-auto
          max-w-[500px]
          md:max-w-none
        "
        style={{ background: bg }}
      >
        {children}
      </div>
    </div>
  );
}
