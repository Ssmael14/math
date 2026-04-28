"use client";
// components/exercises/TraceCanvas.tsx
// Canvas para que el niño trace un dígito con dedo o mouse. Captura los
// puntos del trazo y al levantar el lápiz invoca onStroke con la lista.
// La validación contra el dígito objetivo vive en lib/gesture.ts.
//
// Cuando se le muestra la solución (después de 2 fallos) animamos el path
// del template para que vea cómo se traza el dígito correcto.

import { useEffect, useRef, useState } from "react";
import { DIGIT_TEMPLATES, type Point, type Stroke } from "@/lib/gesture";

export function TraceCanvas({
  digit,
  onStroke,
  size = 280,
  disabled = false,
  showSolution = false,
}: {
  /** Sólo para mostrar como guía/contorno por debajo del trazo. */
  digit: number;
  onStroke: (stroke: Point[]) => void;
  size?: number;
  disabled?: boolean;
  /** Cuando true, anima el trazo correcto en lugar de aceptar input. */
  showSolution?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const pointsRef = useRef<Point[]>([]);
  const animFrameRef = useRef<number | null>(null);
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
    drawGuide(g, size, size, digit);
  }

  // Render inicial + cada vez que cambia el dígito objetivo.
  useEffect(() => {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
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

  // Animación de la solución cuando showSolution pasa a true.
  useEffect(() => {
    if (!showSolution) return;
    const g = ctx();
    if (!g) return;
    if (animFrameRef.current !== null) cancelAnimationFrame(animFrameRef.current);

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      drawSolutionStatic(g, size, digit);
      return;
    }

    const stop = animateSolution(g, size, digit, (id) => { animFrameRef.current = id; });
    return () => {
      stop();
      animFrameRef.current = null;
    };
  }, [showSolution, digit, size]);

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
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
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
        aria-label={showSolution ? `Mirá cómo se traza el ${digit}` : `Trazá el número ${digit}`}
        className="rounded-3xl border-4 border-white touch-none select-none bg-white"
        style={{ boxShadow: "var(--shadow-chunky)", touchAction: "none" }}
      />
      {!showSolution && (
        <button
          type="button"
          onClick={clearAll}
          disabled={!hasInk || disabled}
          className="text-xs font-bold text-ink-soft underline disabled:text-ink-mute disabled:no-underline"
        >
          🧽 Borrar y volver a intentar
        </button>
      )}
    </div>
  );
}

function drawGuide(g: CanvasRenderingContext2D, w: number, h: number, digit: number) {
  g.save();
  g.fillStyle = "#FFE5A3";
  g.font = `bold ${Math.floor(h * 0.85)}px system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(digit), w / 2, h / 2 + h * 0.04);
  g.restore();
}

/**
 * Mapea un template (en coordenadas normalizadas) al canvas (size×size),
 * preservando aspect ratio y centrando con padding del 15%.
 */
function templateToCanvasPoints(tpl: Stroke, size: number): Point[] {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of tpl) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  const tplW = maxX - minX || 1;
  const tplH = maxY - minY || 1;
  const scale = (size * 0.7) / Math.max(tplW, tplH);
  const cx = size / 2 - ((minX + maxX) / 2) * scale;
  const cy = size / 2 - ((minY + maxY) / 2) * scale;
  return tpl.map((p) => ({ x: p.x * scale + cx, y: p.y * scale + cy }));
}

/** Dibuja el trazo completo de una vez (fallback prefers-reduced-motion). */
function drawSolutionStatic(g: CanvasRenderingContext2D, size: number, digit: number) {
  const tpl = DIGIT_TEMPLATES[digit];
  if (!tpl) return;
  const pts = templateToCanvasPoints(tpl, size);

  g.clearRect(0, 0, size, size);
  drawGuide(g, size, size, digit);

  g.save();
  g.strokeStyle = "#3D2E4F";
  g.lineWidth = 14;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for (const p of pts.slice(1)) g.lineTo(p.x, p.y);
  g.stroke();
  g.restore();
}

/**
 * Anima el trazo del template progresivamente. Devuelve una función para
 * cancelar la animación si el componente se desmonta antes de terminar.
 */
function animateSolution(
  g: CanvasRenderingContext2D,
  size: number,
  digit: number,
  setHandle: (id: number) => void,
): () => void {
  const tpl = DIGIT_TEMPLATES[digit];
  if (!tpl) return () => {};
  const pts = templateToCanvasPoints(tpl, size);

  const durationMs = 1500;
  const startTime = performance.now();
  let running = true;

  function frame(now: number) {
    if (!running) return;
    const t = Math.min(1, (now - startTime) / durationMs);
    const upTo = Math.max(1, Math.floor(t * pts.length));

    g.clearRect(0, 0, size, size);
    drawGuide(g, size, size, digit);

    g.save();
    g.strokeStyle = "#3D2E4F";
    g.lineWidth = 14;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let j = 1; j < upTo && j < pts.length; j++) g.lineTo(pts[j].x, pts[j].y);
    g.stroke();

    // "Pluma" en la cabeza del trazo mientras se anima.
    if (upTo < pts.length) {
      const head = pts[upTo - 1];
      g.fillStyle = "#FFC94A";
      g.beginPath();
      g.arc(head.x, head.y, 9, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();

    if (t < 1) {
      const id = requestAnimationFrame(frame);
      setHandle(id);
    }
  }

  const id = requestAnimationFrame(frame);
  setHandle(id);

  return () => {
    running = false;
    if (id) cancelAnimationFrame(id);
  };
}
