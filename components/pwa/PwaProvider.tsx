"use client";
// components/pwa/PwaProvider.tsx
// Registra el service worker y dispara drainQueue cuando vuelve la conexión.
// Se monta una sola vez desde app/layout.tsx.

import { useEffect } from "react";
import { drainQueue } from "@/lib/offline-queue";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Registrar SW (sólo en navegadores que lo soportan; en dev se registra
    // igual — Next sirve /public/sw.js como estático).
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[PWA] sw register failed", err);
      });
    }

    const onOnline = () => {
      drainQueue((url, init) => fetch(url, init)).catch(() => {});
    };

    // Drain inicial por si quedaron items de una sesión anterior.
    onOnline();
    window.addEventListener("online", onOnline);

    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
