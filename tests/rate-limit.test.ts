import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { rateLimit, _resetRateLimitStore } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    _resetRateLimitStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-28T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite hasta `limit` requests dentro de la ventana", () => {
    for (let i = 0; i < 5; i++) {
      expect(rateLimit("k", 5, 60_000).ok).toBe(true);
    }
    expect(rateLimit("k", 5, 60_000).ok).toBe(false);
  });

  it("resetea el contador cuando pasa la ventana", () => {
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 1_000);
    expect(rateLimit("k", 3, 1_000).ok).toBe(false);

    vi.advanceTimersByTime(1_001);
    expect(rateLimit("k", 3, 1_000).ok).toBe(true);
  });

  it("keys distintas no se interfieren", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", 3, 60_000);
    expect(rateLimit("a", 3, 60_000).ok).toBe(false);
    expect(rateLimit("b", 3, 60_000).ok).toBe(true);
  });
});
