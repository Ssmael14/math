// public/sw.js — service worker mínimo para PWA + offline fallback.
//
// Estrategia:
//   - Estáticos (assets de Next, fonts, iconos): cache-first.
//   - Navegación (HTML): network-first con fallback a cache.
//   - APIs: dejarlas pasar al network — el fetch del cliente las encola en
//     localStorage si fallan (lib/offline-queue).
//
// Cuando subimos una versión nueva, bumpeamos CACHE_VERSION para invalidar.

const CACHE_VERSION = "v3";
const CACHE_NAME = `paskalito-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // POST/PUT/etc. los maneja el cliente.

  const url = new URL(req.url);

  // APIs: directo al network. El cliente decide qué hacer si falla.
  if (url.pathname.startsWith("/api/")) return;

  // Next maneja sus propios chunks versionados. No los cacheamos en el SW:
  // servir un chunk viejo puede romper Webpack con "undefined.call".
  if (url.pathname.startsWith("/_next/")) return;

  // Navegación HTML: network-first con fallback a cache, y a /offline si nada.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() =>
        caches.match(req).then((cached) => cached ?? caches.match(OFFLINE_URL)),
      ),
    );
    return;
  }

  // Resto (estáticos): cache-first.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && (url.origin === self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    }),
  );
});
