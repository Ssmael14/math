"use client";
// components/pwa/PwaProvider.tsx
// Registra el service worker y dispara drainQueue cuando vuelve la conexión.
// Se monta una sola vez desde app/layout.tsx.

import { useEffect } from "react";
import { drainQueue } from "@/lib/offline-queue";

export function PwaProvider() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("serviceWorker" in navigator)) return;

    // En desarrollo, un service worker viejo puede servir chunks de Webpack
    // cacheados y romper el runtime con errores tipo "undefined.call".
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .catch(() => {});

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) =>
            Promise.all(
              keys
                .filter((key) => key.startsWith("paskalito-"))
                .map((key) => caches.delete(key)),
            ),
          )
          .catch(() => {});
      }
      return;
    }

    // Registrar SW sólo en producción. Next/Vite dev necesitan control directo
    // sobre sus chunks para evitar inconsistencias durante hot reload.
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
