import { describe, it, expect } from "vitest";
import { INITIAL_ORDER, pick, unpick, toggle, isComplete } from "@/lib/learning/order-state";

describe("OrderState", () => {
  it("pick agrega al final preservando orden", () => {
    let s = INITIAL_ORDER;
    s = pick(s, 3);
    s = pick(s, 1);
    s = pick(s, 6);
    expect(s.picked).toEqual([3, 1, 6]);
  });

  it("pick es no-op si el valor ya está", () => {
    let s = pick(INITIAL_ORDER, 3);
    s = pick(s, 3);
    expect(s.picked).toEqual([3]);
  });

  it("unpick saca el valor preservando el orden del resto", () => {
    let s = pick(pick(pick(INITIAL_ORDER, 3), 1), 6);
    s = unpick(s, 1);
    expect(s.picked).toEqual([3, 6]);
  });

  it("toggle agrega/saca según el estado actual", () => {
    let s = INITIAL_ORDER;
    s = toggle(s, 5);
    expect(s.picked).toEqual([5]);
    s = toggle(s, 5);
    expect(s.picked).toEqual([]);
  });

  it("isComplete cuando picked.length === total", () => {
    expect(isComplete({ picked: [1, 2, 3] }, 3)).toBe(true);
    expect(isComplete({ picked: [1, 2] }, 3)).toBe(false);
  });
});
