import { describe, it, expect } from "vitest";
import {
  INITIAL_MATCH,
  tapGroup,
  tapOption,
  isComplete,
  toPairsArray,
} from "@/lib/learning/match-state";

describe("MatchState", () => {
  it("emparejar tapeando grupo y luego opción", () => {
    let s = INITIAL_MATCH;
    s = tapGroup(s, 0);
    expect(s.selectedGroup).toBe(0);
    s = tapOption(s, 1);
    expect(s.pairs).toEqual({ 0: 1 });
    expect(s.selectedGroup).toBeNull();
    expect(s.selectedOption).toBeNull();
  });

  it("emparejar al revés (opción primero)", () => {
    let s = INITIAL_MATCH;
    s = tapOption(s, 2);
    s = tapGroup(s, 1);
    expect(s.pairs).toEqual({ 1: 2 });
  });

  it("tap sobre grupo ya emparejado lo desempareja", () => {
    let s = INITIAL_MATCH;
    s = tapGroup(s, 0);
    s = tapOption(s, 1);
    s = tapGroup(s, 0); // unpair
    expect(s.pairs).toEqual({});
  });

  it("tap sobre opción ya usada desempareja el par que la usaba", () => {
    let s = INITIAL_MATCH;
    s = tapGroup(s, 0); s = tapOption(s, 1);
    s = tapGroup(s, 1); s = tapOption(s, 2);
    s = tapOption(s, 1); // saca el par 0↔1
    expect(s.pairs).toEqual({ 1: 2 });
  });

  it("toggle sobre grupo seleccionado lo deselecciona", () => {
    let s = INITIAL_MATCH;
    s = tapGroup(s, 0);
    s = tapGroup(s, 0); // toggle off
    expect(s.selectedGroup).toBeNull();
  });

  it("isComplete y toPairsArray", () => {
    let s = INITIAL_MATCH;
    s = tapGroup(s, 0); s = tapOption(s, 1);
    s = tapGroup(s, 1); s = tapOption(s, 0);
    expect(isComplete(s, 2)).toBe(true);
    expect(toPairsArray(s).sort()).toEqual([[0, 1], [1, 0]]);
  });
});
