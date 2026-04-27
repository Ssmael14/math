"use client";
import { useEffect, useState } from "react";

export type LumiVariant = "fluffy" | "sleepy" | "sparkly";

const KEY = "lumiVariant";

export function useLumiVariant(): [LumiVariant, (v: LumiVariant) => void] {
  const [variant, setVariant] = useState<LumiVariant>("fluffy");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem(KEY)) as LumiVariant | null;
    if (saved) setVariant(saved);
  }, []);

  const update = (v: LumiVariant) => {
    setVariant(v);
    if (typeof window !== "undefined") localStorage.setItem(KEY, v);
  };

  return [variant, update];
}
