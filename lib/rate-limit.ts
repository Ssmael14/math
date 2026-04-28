// lib/rate-limit.ts
// Rate limiter en memoria (token bucket simplificado: ventana fija).
//
// Limitaciones conocidas:
//  - El estado vive en memoria del proceso. En despliegues con múltiples
//    instancias (Vercel serverless, varios containers) cada uno cuenta por
//    separado. Para producción real conviene mover esto a Redis/Upstash.
//  - El objetivo de Sprint 1 es cortar el abuso obvio (un script spammeando
//    un endpoint), no dar garantías estrictas.

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Permite hasta `limit` operaciones por `windowMs` para una key.
 * Devuelve { ok: false } cuando se pasa del límite.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const cur = store.get(key);

  if (!cur || cur.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    store.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  if (cur.count >= limit) {
    return { ok: false, remaining: 0, resetAt: cur.resetAt };
  }

  cur.count += 1;
  return { ok: true, remaining: limit - cur.count, resetAt: cur.resetAt };
}

/** Sólo para tests — limpia el store entre casos. */
export function _resetRateLimitStore() {
  store.clear();
}
