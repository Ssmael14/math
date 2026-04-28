// lib/offline-queue.ts
// Cola de operaciones que persisten en localStorage cuando el fetch falla
// (red caída o servidor offline). Cuando vuelve la conectividad, drainQueue
// las reintenta una por una.
//
// Pensada para POSTs idempotentes — los Attempt no son estrictamente
// idempotentes (cada uno genera un row nuevo) pero el costo de duplicar
// algunos en condiciones de red rota es bajo comparado con perderlos.
//
// Diseño:
//  - Backend: Storage (localStorage en browser, in-memory fallback para
//    SSR y tests).
//  - Cada item: { id, url, method, body, addedAt }.
//  - Drain: corre secuencial, deja en la cola lo que falle y se corta
//    al primer fallo (no quema reintentos en serie).

const STORAGE_KEY = "lm_offline_queue_v1";

export type QueuedRequest = {
  id: string;
  url: string;
  method: "POST" | "PUT" | "PATCH";
  body: unknown;
  addedAt: number;
};

export interface KVStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

class MemoryStore implements KVStore {
  private map = new Map<string, string>();
  get(k: string) { return this.map.get(k) ?? null; }
  set(k: string, v: string) { this.map.set(k, v); }
}

function defaultStore(): KVStore {
  if (typeof window === "undefined") return new MemoryStore();
  try {
    // probamos que esté disponible (Safari privado lo bloquea)
    window.localStorage.setItem("__lm_probe", "1");
    window.localStorage.removeItem("__lm_probe");
    // Adaptamos la API DOM (getItem/setItem) a nuestra interfaz KVStore.
    return {
      get: (k) => window.localStorage.getItem(k),
      set: (k, v) => window.localStorage.setItem(k, v),
    };
  } catch {
    return new MemoryStore();
  }
}

export function readQueue(store: KVStore = defaultStore()): QueuedRequest[] {
  const raw = store.get(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedRequest[], store: KVStore = defaultStore()) {
  store.set(STORAGE_KEY, JSON.stringify(items));
}

function genId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Encola una request. Devuelve el item agregado. */
export function enqueue(
  req: { url: string; method?: "POST" | "PUT" | "PATCH"; body: unknown },
  store: KVStore = defaultStore(),
): QueuedRequest {
  const item: QueuedRequest = {
    id: genId(),
    url: req.url,
    method: req.method ?? "POST",
    body: req.body,
    addedAt: Date.now(),
  };
  const queue = readQueue(store);
  queue.push(item);
  writeQueue(queue, store);
  return item;
}

export function clearQueue(store: KVStore = defaultStore()) {
  writeQueue([], store);
}

/**
 * Drena la cola enviando cada request en orden. Se detiene al primer fallo
 * y deja el resto en la cola para el próximo intento.
 *
 * Devuelve { sent, remaining }.
 */
export async function drainQueue(
  fetcher: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean }>,
  store: KVStore = defaultStore(),
): Promise<{ sent: number; remaining: number }> {
  const queue = readQueue(store);
  let sent = 0;

  while (queue.length > 0) {
    const item = queue[0];
    let ok = false;
    try {
      const res = await fetcher(item.url, {
        method: item.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(item.body),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }
    if (!ok) break;
    queue.shift();
    sent += 1;
  }

  writeQueue(queue, store);
  return { sent, remaining: queue.length };
}

/**
 * Helper: intenta enviar un POST y, si falla por red, lo encola.
 * Llamalo en lugar de fetch() para attempts/progress/etc.
 */
export async function postOrQueue(
  url: string,
  body: unknown,
  store: KVStore = defaultStore(),
): Promise<{ delivered: boolean }> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) return { delivered: true };
    // 4xx/5xx que no son network: no encolamos para no spammear (probablemente
    // un bug de validación que se va a repetir).
    if (res.status >= 400 && res.status < 500) return { delivered: false };
    enqueue({ url, body }, store);
    return { delivered: false };
  } catch {
    enqueue({ url, body }, store);
    return { delivered: false };
  }
}
