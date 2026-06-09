"use client";
// components/exercises/TraceCanvas.tsx
// Trazado infantil de dígitos — SOLO UI y captura. La evaluación vive en
// lib/learning/trace-scoring.ts y las plantillas en trace-templates.ts.
//
// Diseño pensado para chicos de 4-6:
//   - MULTI-TRAZO: levantar el dedo NO termina el ejercicio. El "8" puede
//     hacerse en 2 óvalos, el "4" en 2 líneas, etc.
//   - Guía por contorno: el número grande tenue + su contorno punteado.
//   - Se evalúa SÓLO al tocar "Terminé" (nunca automático).
//   - Score por cobertura de máscara (tolera temblor, tamaño y dirección).
//   - Botones grandes "Terminé" / "Borrar".

import { useEffect, useMemo, useRef, useState } from "react";
import { digitTemplate, type DigitTemplate } from "@/lib/learning/trace-templates";
import { scoreTrace } from "@/lib/learning/trace-scoring";

type Pt = { x: number; y: number };

// Resolución de la máscara/scoring (downsample → rápido en mobile).
const MASK_RES = 120;
// Grosor relativo del trazo y de la zona válida (en fracción del lado).
const STROKE_FRAC = 0.16;

export type TraceResult = { correct: boolean; stars: 0 | 1 | 2 | 3; score: number };

export function TraceCanvas({
  digit,
  onResult,
  disabled = false,
  showSolution = false,
  size = 280,
}: {
  digit: number;
  /** Se invoca SÓLO cuando el niño toca "Terminé". */
  onResult: (r: TraceResult) => void;
  disabled?: boolean;
  /** Cuando true, anima el trazo correcto y bloquea el input. */
  showSolution?: boolean;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  // allStrokes: todos los trazos terminados. currentStroke: el que se dibuja.
  const allStrokesRef = useRef<Pt[][]>([]);
  const currentStrokeRef = useRef<Pt[]>([]);
  const animRef = useRef<number | null>(null);
  const [hasInk, setHasInk] = useState(false);

  const tpl = useMemo(() => digitTemplate(digit), [digit]);

  // --- Máscara offscreen (zona válida) — se recalcula al cambiar el dígito.
  const mask = useMemo(() => buildMask(tpl), [tpl]);

  function ctx() {
    const c = canvasRef.current;
    return c ? c.getContext("2d") : null;
  }

  function repaint() {
    const g = ctx();
    if (!g) return;
    g.clearRect(0, 0, size, size);
    drawGuide(g, size, digit, tpl);
    // Re-dibujar toda la tinta acumulada (multi-trazo).
    g.save();
    g.strokeStyle = "#102042";
    g.lineWidth = size * STROKE_FRAC * 0.55;
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const stroke of [...allStrokesRef.current, currentStrokeRef.current]) {
      if (stroke.length < 2) continue;
      g.beginPath();
      g.moveTo(stroke[0].x, stroke[0].y);
      for (const pt of stroke.slice(1)) g.lineTo(pt.x, pt.y);
      g.stroke();
    }
    g.restore();
  }

  function clearAll() {
    allStrokesRef.current = [];
    currentStrokeRef.current = [];
    setHasInk(false);
    repaint();
  }

  // Setup del canvas (HiDPI) + repaint al cambiar dígito/size.
  useEffect(() => {
    const c = canvasRef.current;
    const g = ctx();
    if (!c || !g) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr;
    c.height = size * dpr;
    c.style.width = `${size}px`;
    c.style.height = `${size}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    allStrokesRef.current = [];
    currentStrokeRef.current = [];
    setHasInk(false);
    repaint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit, size]);

  // Animación de la solución.
  useEffect(() => {
    if (!showSolution || !tpl) return;
    const g = ctx();
    if (!g) return;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      drawSolution(g, size, digit, tpl, 1);
      return;
    }
    const start = performance.now();
    let running = true;
    const tick = (now: number) => {
      if (!running) return;
      const t = Math.min(1, (now - start) / 1600);
      drawSolution(g, size, digit, tpl, t);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
      animRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSolution, digit, size]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): Pt {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled || showSolution) return;
    e.preventDefault();
    drawingRef.current = true;
    currentStrokeRef.current = [getPoint(e)];
    canvasRef.current?.setPointerCapture(e.pointerId);
    repaint();
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || disabled || showSolution) return;
    e.preventDefault();
    currentStrokeRef.current.push(getPoint(e));
    repaint();
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try { canvasRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
    // Cerrar el trazo actual y guardarlo. NO se evalúa: el niño puede
    // seguir agregando trazos (8 = 2 óvalos) hasta tocar "Terminé".
    if (currentStrokeRef.current.length >= 2) {
      allStrokesRef.current.push(currentStrokeRef.current);
      setHasInk(true);
    }
    currentStrokeRef.current = [];
    repaint();
  }

  function finish() {
    if (disabled || !mask) return;
    const counts = rasterizeAndCount(allStrokesRef.current, size, mask);
    const result = scoreTrace({
      maskCount: mask.count,
      insideCount: counts.inside,
      outsideCount: counts.outside,
    });
    onResult({ correct: result.ok, stars: result.stars, score: result.score });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label={showSolution ? `Así se traza el ${digit}` : `Traza el número ${digit} con el dedo`}
        className="rounded-3xl border-4 border-white touch-none select-none bg-white"
        style={{ boxShadow: "var(--shadow-chunky)", touchAction: "none" }}
      />

      {!showSolution && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearAll}
            disabled={!hasInk || disabled}
            className="btn-chunky py-2.5 px-5 rounded-full bg-white border-2 border-ink/10 text-ink font-bold text-sm disabled:opacity-40"
            style={{ boxShadow: "var(--shadow-chunky-sm)" }}
          >
            🧽 Borrar
          </button>
          <button
            type="button"
            onClick={finish}
            disabled={!hasInk || disabled}
            className="btn-chunky py-2.5 px-7 rounded-full bg-mint text-white font-black uppercase tracking-wide text-sm disabled:opacity-40"
            style={{ boxShadow: "0 4px 0 #1F9E46" }}
          >
            ✓ Terminé
          </button>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// Render helpers
// =========================================================================

function drawGuide(g: CanvasRenderingContext2D, size: number, digit: number, tpl: DigitTemplate | null) {
  // Número grande tenue de fondo.
  g.save();
  g.fillStyle = "#FFE7AC";
  g.font = `bold ${Math.floor(size * 0.82)}px system-ui, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(String(digit), size / 2, size / 2 + size * 0.03);
  g.restore();

  // Contorno punteado a seguir.
  if (!tpl) return;
  g.save();
  g.strokeStyle = "#D99A00";
  g.globalAlpha = 0.5;
  g.lineWidth = Math.max(2, size * 0.012);
  g.lineCap = "round";
  g.setLineDash([size * 0.03, size * 0.03]);
  for (const poly of tpl) {
    g.beginPath();
    g.moveTo(poly[0].x * size, poly[0].y * size);
    for (const pt of poly.slice(1)) g.lineTo(pt.x * size, pt.y * size);
    g.stroke();
  }
  g.restore();
}

function drawSolution(
  g: CanvasRenderingContext2D,
  size: number,
  digit: number,
  tpl: DigitTemplate,
  t: number,
) {
  g.clearRect(0, 0, size, size);
  drawGuide(g, size, digit, tpl);
  g.save();
  g.strokeStyle = "#102042";
  g.lineWidth = size * STROKE_FRAC * 0.55;
  g.lineCap = "round";
  g.lineJoin = "round";

  // Reparte el progreso `t` entre todas las polilíneas en secuencia.
  const totalPts = tpl.reduce((s, poly) => s + poly.length, 0);
  let budget = Math.max(1, Math.floor(t * totalPts));
  for (const poly of tpl) {
    if (budget <= 0) break;
    const upTo = Math.min(poly.length, budget);
    if (upTo >= 2) {
      g.beginPath();
      g.moveTo(poly[0].x * size, poly[0].y * size);
      for (let i = 1; i < upTo; i++) g.lineTo(poly[i].x * size, poly[i].y * size);
      g.stroke();
    }
    budget -= poly.length;
  }
  g.restore();
}

// =========================================================================
// Máscara + rasterización (downsampled, sin lag)
// =========================================================================

type Mask = { data: Uint8Array; res: number; count: number };

function buildMask(tpl: DigitTemplate | null): Mask | null {
  if (!tpl || typeof document === "undefined") return null;
  const res = MASK_RES;
  const c = document.createElement("canvas");
  c.width = res;
  c.height = res;
  const g = c.getContext("2d");
  if (!g) return null;
  g.strokeStyle = "#000";
  g.lineWidth = res * STROKE_FRAC;
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const poly of tpl) {
    g.beginPath();
    g.moveTo(poly[0].x * res, poly[0].y * res);
    for (const pt of poly.slice(1)) g.lineTo(pt.x * res, pt.y * res);
    g.stroke();
  }
  const img = g.getImageData(0, 0, res, res).data;
  const data = new Uint8Array(res * res);
  let count = 0;
  for (let i = 0; i < res * res; i++) {
    if (img[i * 4 + 3] > 40) { data[i] = 1; count++; }
  }
  return { data, res, count };
}

function rasterizeAndCount(
  strokes: Pt[][],
  size: number,
  mask: Mask,
): { inside: number; outside: number } {
  if (typeof document === "undefined") return { inside: 0, outside: 0 };
  const res = mask.res;
  const c = document.createElement("canvas");
  c.width = res;
  c.height = res;
  const g = c.getContext("2d");
  if (!g) return { inside: 0, outside: 0 };
  const k = res / size;
  g.strokeStyle = "#000";
  g.lineWidth = res * STROKE_FRAC * 0.7;
  g.lineCap = "round";
  g.lineJoin = "round";
  for (const stroke of strokes) {
    if (stroke.length < 2) continue;
    g.beginPath();
    g.moveTo(stroke[0].x * k, stroke[0].y * k);
    for (const pt of stroke.slice(1)) g.lineTo(pt.x * k, pt.y * k);
    g.stroke();
  }
  const img = g.getImageData(0, 0, res, res).data;
  let inside = 0;
  let outside = 0;
  for (let i = 0; i < res * res; i++) {
    if (img[i * 4 + 3] > 40) {
      if (mask.data[i]) inside++;
      else outside++;
    }
  }
  return { inside, outside };
}
