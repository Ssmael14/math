// lib/gesture.ts
// Reconocimiento de trazos basado en $1 Unistroke Recognizer
// (Wobbrock, Wilson, Li · UIST 2007), pero SIN la alineación rotacional —
// para dígitos la orientación importa: un "1" rotado 90° no es un "1".
//
// Pipeline:
//   1. Resample → N=64 puntos equidistantes a lo largo del trazo.
//   2. Center & scale → bbox centrada en origen, lado mayor = SQUARE_SIZE
//      (preserva aspect ratio — un trazo vertical NO se estira a cuadrado).
//   3. Match  → distancia path-to-path point-by-point.
//
// Para LearnMath comparamos sólo contra UN template (el dígito objetivo),
// porque no necesitamos clasificar lo que dibujó — sólo confirmar si se
// parece al dígito que pidió el ejercicio. Esto es generoso a propósito:
// los chicos de 4-6 hacen trazos muy variables.

const SAMPLE_POINTS = 64;
const SQUARE_SIZE = 250;
const HALF_DIAGONAL = 0.5 * Math.sqrt(SQUARE_SIZE * SQUARE_SIZE + SQUARE_SIZE * SQUARE_SIZE);

export type Point = { x: number; y: number };
export type Stroke = Point[];

/** Normaliza un trazo crudo en una representación canónica de 64 puntos. */
export function normalizeStroke(raw: Stroke): Stroke {
  if (raw.length < 2) return raw.slice();
  let s = resample(raw, SAMPLE_POINTS);
  s = centerAndScale(s, SQUARE_SIZE);
  return s;
}

/**
 * Compara `candidate` contra `template` (ya normalizados) y devuelve un
 * score 0..1 (1 = idéntico). Sin rotación — la orientación cuenta.
 */
export function similarity(candidate: Stroke, template: Stroke): number {
  const d = pathDistance(candidate, template);
  return Math.max(0, 1 - d / HALF_DIAGONAL);
}

/**
 * Devuelve cuántas estrellas (0-3) se merece un score de trazado:
 *   ≥ 0.75 → 3 ⭐ (excelente)
 *   ≥ 0.60 → 2 ⭐ (muy bien)
 *   ≥ 0.50 → 1 ⭐ (casi, lo aceptamos)
 *   <  0.50 → 0 ⭐ (no se parece)
 *
 * Los thresholds están calibrados para que una línea horizontal NO matchee
 * como "1" (score ~0.49) pero una vertical decente sí (score >= 0.7).
 */
export function scoreToStars(score: number): 0 | 1 | 2 | 3 {
  if (score >= 0.75) return 3;
  if (score >= 0.6) return 2;
  if (score >= 0.5) return 1;
  return 0;
}

/**
 * Decide si el trazo dibujado se parece "lo suficiente" al dígito objetivo.
 * El threshold default (0.5) es generoso pero no permisivo — coincide con
 * el primer bracket de scoreToStars.
 */
export function matchesDigit(
  raw: Stroke,
  digit: number,
  threshold = 0.5,
): { ok: boolean; score: number; stars: 0 | 1 | 2 | 3 } {
  const tpl = DIGIT_TEMPLATES[digit];
  if (!tpl) return { ok: false, score: 0, stars: 0 };
  if (raw.length < 8) return { ok: false, score: 0, stars: 0 };
  const candidate = normalizeStroke(raw);
  const score = similarity(candidate, tpl);
  return { ok: score >= threshold, score, stars: scoreToStars(score) };
}

// =========================================================================
// Pasos $1 Recognizer
// =========================================================================
function pathLength(points: Stroke): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) {
    d += dist(points[i - 1], points[i]);
  }
  return d;
}

function resample(points: Stroke, n: number): Stroke {
  const I = pathLength(points) / (n - 1);
  let D = 0;
  const out: Stroke = [points[0]];
  const work = points.slice();
  for (let i = 1; i < work.length; i++) {
    const d = dist(work[i - 1], work[i]);
    if (D + d >= I) {
      const t = (I - D) / d;
      const qx = work[i - 1].x + t * (work[i].x - work[i - 1].x);
      const qy = work[i - 1].y + t * (work[i].y - work[i - 1].y);
      const q = { x: qx, y: qy };
      out.push(q);
      work.splice(i, 0, q);
      D = 0;
    } else {
      D += d;
    }
  }
  // por error de redondeo a veces falta el último punto
  while (out.length < n) out.push({ x: points[points.length - 1].x, y: points[points.length - 1].y });
  return out.slice(0, n);
}

/**
 * Centra la bbox del trazo en el origen y escala preservando aspect ratio
 * (lado mayor = `size`). Crítico para dígitos: un "1" mantiene su forma
 * angosta en lugar de inflarse a cuadrado.
 */
function centerAndScale(points: Stroke, size: number): Stroke {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const span = Math.max(w, h) || 1;
  const scale = size / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return points.map((p) => ({ x: (p.x - cx) * scale, y: (p.y - cy) * scale }));
}

function pathDistance(a: Stroke, b: Stroke): number {
  const n = Math.min(a.length, b.length);
  let d = 0;
  for (let i = 0; i < n; i++) d += dist(a[i], b[i]);
  return d / n;
}

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// =========================================================================
// Templates de dígitos 0-9
// Cada uno es un trazo aproximado en coordenadas [0..1] x [0..1].
// (0,0) arriba-izquierda. Pre-normalizados con normalizeStroke al cargar.
// =========================================================================
function tpl(points: number[][]): Stroke {
  return normalizeStroke(points.map(([x, y]) => ({ x, y })));
}

const RAW_DIGIT_TEMPLATES: Record<number, number[][]> = {
  // 0: círculo (empieza arriba, va a la izquierda, baja, sube cerrando)
  0: [
    [0.5, 0.0], [0.3, 0.05], [0.15, 0.2], [0.05, 0.4],
    [0.05, 0.6], [0.15, 0.8], [0.3, 0.95], [0.5, 1.0],
    [0.7, 0.95], [0.85, 0.8], [0.95, 0.6], [0.95, 0.4],
    [0.85, 0.2], [0.7, 0.05], [0.5, 0.0],
  ],
  // 1: línea vertical (con un gancho arriba opcional, kids no lo hacen)
  1: [
    [0.5, 0.0], [0.5, 0.15], [0.5, 0.3], [0.5, 0.45],
    [0.5, 0.6], [0.5, 0.75], [0.5, 0.9], [0.5, 1.0],
  ],
  // 2: curva arriba-derecha → diagonal a abajo-izquierda → horizontal a la derecha
  2: [
    [0.1, 0.2], [0.2, 0.05], [0.4, 0.0], [0.6, 0.0],
    [0.8, 0.1], [0.85, 0.3], [0.7, 0.5], [0.5, 0.65],
    [0.3, 0.8], [0.15, 0.95], [0.3, 1.0], [0.5, 1.0],
    [0.7, 1.0], [0.9, 1.0],
  ],
  // 3: dos curvas a la derecha (arriba y abajo)
  3: [
    [0.15, 0.1], [0.3, 0.0], [0.5, 0.0], [0.75, 0.05],
    [0.9, 0.2], [0.85, 0.4], [0.65, 0.5], [0.45, 0.5],
    [0.65, 0.55], [0.85, 0.65], [0.95, 0.8], [0.85, 0.95],
    [0.6, 1.0], [0.35, 1.0], [0.15, 0.9],
  ],
  // 4: vertical hacia abajo a la mitad → horizontal a la derecha → vertical largo bajando
  // (versión single-stroke: baja, gira a la derecha, sube y vuelve a bajar)
  4: [
    [0.2, 0.0], [0.2, 0.2], [0.2, 0.4], [0.2, 0.55],
    [0.4, 0.55], [0.6, 0.55], [0.8, 0.55],
    [0.7, 0.4], [0.7, 0.2], [0.7, 0.0],
    [0.7, 0.2], [0.7, 0.4], [0.7, 0.6],
    [0.7, 0.8], [0.7, 1.0],
  ],
  // 5: horizontal arriba → vertical bajando → curva abajo a la derecha y baja
  5: [
    [0.85, 0.0], [0.6, 0.0], [0.35, 0.0], [0.2, 0.0],
    [0.2, 0.2], [0.2, 0.4], [0.4, 0.4], [0.6, 0.45],
    [0.8, 0.55], [0.9, 0.7], [0.85, 0.9], [0.65, 1.0],
    [0.4, 1.0], [0.2, 0.9],
  ],
  // 6: curva bajando desde arriba-derecha hasta cerrar un círculo abajo
  6: [
    [0.8, 0.0], [0.65, 0.05], [0.5, 0.15], [0.35, 0.3],
    [0.2, 0.5], [0.15, 0.7], [0.2, 0.85], [0.4, 1.0],
    [0.6, 1.0], [0.8, 0.9], [0.85, 0.75], [0.75, 0.6],
    [0.55, 0.55], [0.35, 0.6], [0.2, 0.7],
  ],
  // 7: horizontal arriba → diagonal hacia abajo-izquierda
  7: [
    [0.1, 0.0], [0.3, 0.0], [0.5, 0.0], [0.7, 0.0], [0.9, 0.0],
    [0.8, 0.2], [0.7, 0.4], [0.6, 0.55], [0.5, 0.7], [0.4, 0.85], [0.3, 1.0],
  ],
  // 8: dos círculos verticales (single-stroke: empieza arriba, baja a la izq, sube por la der haciendo el ocho)
  8: [
    [0.5, 0.0], [0.3, 0.1], [0.2, 0.25], [0.3, 0.4],
    [0.5, 0.5], [0.7, 0.6], [0.8, 0.75], [0.7, 0.9],
    [0.5, 1.0], [0.3, 0.9], [0.2, 0.75], [0.3, 0.6],
    [0.5, 0.5], [0.7, 0.4], [0.8, 0.25], [0.7, 0.1], [0.5, 0.0],
  ],
  // 9: círculo arriba → línea bajando hacia la derecha
  9: [
    [0.7, 0.05], [0.55, 0.0], [0.4, 0.05], [0.25, 0.15],
    [0.2, 0.3], [0.25, 0.45], [0.4, 0.55], [0.6, 0.55],
    [0.75, 0.45], [0.8, 0.3], [0.8, 0.45], [0.8, 0.6],
    [0.75, 0.75], [0.7, 0.9], [0.65, 1.0],
  ],
};

export const DIGIT_TEMPLATES: Record<number, Stroke> = Object.fromEntries(
  Object.entries(RAW_DIGIT_TEMPLATES).map(([k, v]) => [Number(k), tpl(v)]),
);
