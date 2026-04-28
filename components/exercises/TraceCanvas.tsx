"use client";
// components/exercises/TraceCanvas.tsx
// Canvas para que el niño trace un dígito con dedo o mouse. Captura los
// puntos del trazo y al levantar el lápiz invoca onStroke con la lista.
// La validación contra el dígito objetivo vive en lib/gesture.ts.

import { useEffect, useRef, useState } from "react";
import type { Point } from "@/lib/gesture";

export type TraceCanvasHandle = {
  clear: () => void;
};

export function TraceCanvas({
  digit,
  onStroke,
  onClear,
  size = 280,
  disabled = false,
}: {
  /** Sólo para mostrar como guía/contorno por debajo del trazo. */
  digit: number;
  onStroke: (stroke: Point[]) => void;
  onClear?: () => void;
  size?: number;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const [hasInk, setHasInk] = useState(false);

  function ctx() {
    const c = canvasRef.current;
    return c ? c.getContext("2d") : null;
  }

  function clearAll() {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    g.clearRect(0, 0, c.width, c.height);
    pointsRef.current = [];
    setHasInk(false);
    drawGuide(g, c.width, c.height, digit);
    onClear?.();
  }

  // Render inicial + cada vez que cambia el dígito objetivo.
  useEffect(() => {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    // soporte HiDPI
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    g.scale(dpr, dpr);
    drawGuide(g, size, size, digit);
    pointsRef.current = [];
    setHasInk(false);
  }, [digit, size]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    e.preventDefault();
    const p = getPoint(e);
    drawingRef.current = true;
    pointsRef.current = [p];
    canvasRef.current?.setPointerCapture(e.pointerId);
    const g = ctx(); if (!g) return;
    g.beginPath();
    g.moveTo(p.x, p.y);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || disabled) return;
    e.preventDefault();
    const p = getPoint(e);
    pointsRef.current.push(p);
    const g = ctx(); if (!g) return;
    g.strokeStyle = "#3D2E4F";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.lineTo(p.x, p.y);
    g.stroke();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(e.pointerId);
    if (pointsRef.current.length >= 8) {
      setHasInk(true);
      onStroke(pointsRef.current.slice());
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label={`Trazá el número ${digit}`}
        className="rounded-3xl border-4 border-white touch-none select-none bg-white"
        style={{ boxShadow: "var(--shadow-chunky)", touchAction: "none" }}
      />
      <button
        type="button"
        onClick={clearAll}
        disabled={!hasInk || disabled}
        className="text-xs font-bold text-ink-soft underline disabled:text-ink-mute disabled:no-underline"
      >
        🧽 Borrar y volver a intentar
      </button>
    </div>
  );
}

/**
 * Dibuja el dígito objetivo grande, tenue, como guía visual debajo
 * del trazado del niño. Es decorativo — no es lo que se compara.
 */
function drawGuide(g: CanvasRenderingContext2D, w: number, h: number, digit: number) {
  g.save();
  g.fillStyle = "#FFE5A3";
  g.font = `bold ${Math.floor(h * 0.85)}px system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(digit), w / 2, h / 2 + h * 0.04);
  g.restore();
}
