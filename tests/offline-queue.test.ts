import { describe, it, expect, beforeEach } from "vitest";
import {
  readQueue,
  enqueue,
  drainQueue,
  clearQueue,
  type KVStore,
} from "@/lib/offline-queue";

class TestStore implements KVStore {
  data = new Map<string, string>();
  get(k: string) { return this.data.get(k) ?? null; }
  set(k: string, v: string) { this.data.set(k, v); }
}

let store: TestStore;
beforeEach(() => {
  store = new TestStore();
});

describe("readQueue", () => {
  it("vacía cuando no hay nada guardado", () => {
    expect(readQueue(store)).toEqual([]);
  });

  it("vacía cuando el JSON está corrupto", () => {
    store.set("lm_offline_queue_v1", "{not json");
    expect(readQueue(store)).toEqual([]);
  });
});

describe("enqueue", () => {
  it("agrega un item con id y addedAt", () => {
    const item = enqueue({ url: "/api/x", body: { a: 1 } }, store);
    expect(item.id).toBeDefined();
    expect(item.addedAt).toBeGreaterThan(0);
    expect(readQueue(store)).toHaveLength(1);
  });

  it("default method es POST", () => {
    const item = enqueue({ url: "/x", body: {} }, store);
    expect(item.method).toBe("POST");
  });

  it("preserva orden", () => {
    enqueue({ url: "/1", body: {} }, store);
    enqueue({ url: "/2", body: {} }, store);
    enqueue({ url: "/3", body: {} }, store);
    expect(readQueue(store).map((q) => q.url)).toEqual(["/1", "/2", "/3"]);
  });
});

describe("drainQueue", () => {
  it("envía todo cuando el fetcher devuelve ok", async () => {
    enqueue({ url: "/1", body: {} }, store);
    enqueue({ url: "/2", body: {} }, store);
    const calls: string[] = [];
    const fetcher = async (url: string) => { calls.push(url); return { ok: true }; };
    const res = await drainQueue(fetcher, store);
    expect(res).toEqual({ sent: 2, remaining: 0 });
    expect(calls).toEqual(["/1", "/2"]);
    expect(readQueue(store)).toEqual([]);
  });

  it("se detiene al primer fallo", async () => {
    enqueue({ url: "/1", body: {} }, store);
    enqueue({ url: "/2", body: {} }, store);
    enqueue({ url: "/3", body: {} }, store);
    const fetcher = async (url: string) => ({ ok: url !== "/2" });
    const res = await drainQueue(fetcher, store);
    expect(res).toEqual({ sent: 1, remaining: 2 });
    expect(readQueue(store).map((q) => q.url)).toEqual(["/2", "/3"]);
  });

  it("trata exceptions como fallo de red", async () => {
    enqueue({ url: "/1", body: {} }, store);
    const fetcher = async () => { throw new Error("offline"); };
    const res = await drainQueue(fetcher, store);
    expect(res.sent).toBe(0);
    expect(res.remaining).toBe(1);
  });
});

describe("clearQueue", () => {
  it("vacía la cola", () => {
    enqueue({ url: "/1", body: {} }, store);
    clearQueue(store);
    expect(readQueue(store)).toEqual([]);
  });
});
