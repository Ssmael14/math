"use client";

import { useEffect } from "react";

export function ScrollToCurrentLesson() {
  useEffect(() => {
    const currentLesson = document.querySelector<HTMLElement>(
      "[data-current-lesson]",
    );
    if (!currentLesson) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const frame = window.requestAnimationFrame(() => {
      currentLesson.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return null;
}
