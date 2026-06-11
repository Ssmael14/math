"use client";

import { useEffect, useState, type RefObject } from "react";

export const MATCH_PALETTE = [
  { bg: "bg-mint", stroke: "#34c759" },
  { bg: "bg-sky", stroke: "#4867f5" },
  { bg: "bg-pink", stroke: "#ff5a78" },
  { bg: "bg-sun", stroke: "#ffc94a" },
  { bg: "bg-lilac", stroke: "#7c6cff" },
] as const;

type PairLine = {
  color: string;
  key: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export function MatchPairLines({
  containerRef,
  leftRefs,
  pairs,
  rightRefs,
}: {
  containerRef: RefObject<HTMLElement | null>;
  leftRefs: RefObject<Array<HTMLElement | null>>;
  pairs: Record<number, number>;
  rightRefs: RefObject<Array<HTMLElement | null>>;
}) {
  const [lines, setLines] = useState<PairLine[]>([]);

  useEffect(() => {
    let frame = 0;

    function updateLines() {
      const container = containerRef.current;
      if (!container) {
        setLines([]);
        return;
      }

      const containerBox = container.getBoundingClientRect();
      const next: PairLine[] = [];

      Object.entries(pairs).forEach(([leftIndex, rightIndex], order) => {
          const left = leftRefs.current[Number(leftIndex)];
          const right = rightRefs.current[rightIndex];
          if (!left || !right) return;

          const leftBox = left.getBoundingClientRect();
          const rightBox = right.getBoundingClientRect();
          next.push({
            color: MATCH_PALETTE[order % MATCH_PALETTE.length].stroke,
            key: `${leftIndex}-${rightIndex}`,
            x1: leftBox.right - containerBox.left - 2,
            x2: rightBox.left - containerBox.left + 2,
            y1: leftBox.top - containerBox.top + leftBox.height / 2,
            y2: rightBox.top - containerBox.top + rightBox.height / 2,
          });
        });

      setLines(next);
    }

    frame = window.requestAnimationFrame(updateLines);
    window.addEventListener("resize", updateLines);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateLines);
    };
  }, [containerRef, leftRefs, pairs, rightRefs]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {lines.map((line) => {
        const midX = (line.x1 + line.x2) / 2;
        const path = `M ${line.x1} ${line.y1} C ${midX} ${line.y1}, ${midX} ${line.y2}, ${line.x2} ${line.y2}`;
        return (
          <g key={line.key}>
            <path
              d={path}
              fill="none"
              stroke="white"
              strokeLinecap="round"
              strokeWidth="14"
            />
            <path
              className="drop-shadow-sm"
              d={path}
              fill="none"
              stroke={line.color}
              strokeLinecap="round"
              strokeWidth="6"
            />
            <circle cx={line.x1} cy={line.y1} fill="white" r="7" />
            <circle cx={line.x2} cy={line.y2} fill="white" r="7" />
            <circle cx={line.x1} cy={line.y1} fill={line.color} r="4" />
            <circle cx={line.x2} cy={line.y2} fill={line.color} r="4" />
          </g>
        );
      })}
    </svg>
  );
}
