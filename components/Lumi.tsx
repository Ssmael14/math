"use client";
import type { LumiVariant } from "@/lib/use-lumi-variant";
import { brand } from "@/lib/brand";

interface Props {
  variant?: LumiVariant;
  size?: number;
  animate?: boolean;
  mood?: "happy" | "sad" | "celebrate" | "sleepy" | "teach";
}

export function Lumi({ variant = "fluffy", size = 120, animate = true, mood = "happy" }: Props) {
  const src =
    mood === "celebrate"
      ? brand.assets.mascotCelebrate
      : mood === "sad"
        ? brand.assets.mascotSad
        : mood === "sleepy" || variant === "sleepy"
          ? brand.assets.mascotSleepy
          : mood === "teach"
            ? brand.assets.mascotTeach
            : brand.assets.mascotHappy;

  return (
    <div
      className={animate ? "animate-bob" : ""}
      style={{ width: size, height: size, position: "relative" }}
      aria-label={brand.mascotName}
    >
      <img
        src={src}
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
      {variant === "sparkly" && mood === "happy" ? (
        <span
          className="pointer-events-none absolute right-0 top-0 text-[18%] leading-none"
          aria-hidden
        >
          ✨
        </span>
      ) : null}
    </div>
  );
}
