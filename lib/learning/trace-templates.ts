// lib/learning/trace-templates.ts
// Plantillas de dígitos como POLILÍNEAS (no como nube de puntos para $1).
// Cada dígito es 1+ polilíneas en coordenadas normalizadas [0..1] × [0..1]
// con (0,0) arriba-izquierda. Soportar varias polilíneas permite dígitos
// multi-trazo "naturales" (el 8 = dos óvalos, el 4 = dos líneas).
//
// Se usan para:
//   - dibujar la guía punteada que el niño debe seguir
//   - rasterizar la "zona válida" (máscara) contra la que se puntúa
//   - animar el trazo correcto cuando se muestra la solución

export type TPoint = { x: number; y: number };
export type Polyline = TPoint[];
export type DigitTemplate = Polyline[];

function p(pairs: number[][]): Polyline {
  return pairs.map(([x, y]) => ({ x, y }));
}

export const DIGIT_TEMPLATES: Record<number, DigitTemplate> = {
  0: [
    p([
      [0.50, 0.06], [0.30, 0.12], [0.16, 0.30], [0.12, 0.50],
      [0.16, 0.70], [0.30, 0.88], [0.50, 0.94], [0.70, 0.88],
      [0.84, 0.70], [0.88, 0.50], [0.84, 0.30], [0.70, 0.12], [0.50, 0.06],
    ]),
  ],
  1: [
    p([[0.34, 0.22], [0.50, 0.10], [0.50, 0.90]]),
    p([[0.34, 0.90], [0.68, 0.90]]),
  ],
  2: [
    p([
      [0.18, 0.26], [0.28, 0.12], [0.50, 0.08], [0.70, 0.14],
      [0.78, 0.32], [0.66, 0.52], [0.44, 0.68], [0.22, 0.84],
      [0.16, 0.92], [0.40, 0.92], [0.84, 0.92],
    ]),
  ],
  3: [
    p([
      [0.20, 0.16], [0.40, 0.07], [0.66, 0.10], [0.80, 0.26],
      [0.66, 0.45], [0.46, 0.50],
    ]),
    p([
      [0.46, 0.50], [0.70, 0.56], [0.84, 0.74], [0.70, 0.90],
      [0.44, 0.94], [0.20, 0.84],
    ]),
  ],
  4: [
    p([[0.66, 0.10], [0.66, 0.92]]),
    p([[0.66, 0.10], [0.16, 0.66], [0.86, 0.66]]),
  ],
  5: [
    p([[0.74, 0.10], [0.30, 0.10], [0.26, 0.46]]),
    p([
      [0.26, 0.46], [0.50, 0.40], [0.74, 0.50], [0.82, 0.70],
      [0.70, 0.90], [0.44, 0.94], [0.22, 0.86],
    ]),
  ],
  6: [
    p([
      [0.72, 0.10], [0.48, 0.16], [0.30, 0.36], [0.22, 0.60],
      [0.26, 0.80], [0.44, 0.93], [0.64, 0.92], [0.80, 0.78],
      [0.80, 0.60], [0.64, 0.48], [0.42, 0.50], [0.26, 0.62],
    ]),
  ],
  7: [
    p([[0.18, 0.12], [0.84, 0.12], [0.46, 0.92]]),
  ],
  8: [
    p([
      [0.50, 0.50], [0.34, 0.40], [0.30, 0.24], [0.42, 0.10],
      [0.58, 0.10], [0.70, 0.24], [0.66, 0.40], [0.50, 0.50],
    ]),
    p([
      [0.50, 0.50], [0.32, 0.62], [0.26, 0.78], [0.40, 0.92],
      [0.60, 0.92], [0.74, 0.78], [0.68, 0.62], [0.50, 0.50],
    ]),
  ],
  9: [
    p([
      [0.74, 0.40], [0.58, 0.50], [0.40, 0.46], [0.30, 0.30],
      [0.38, 0.14], [0.58, 0.08], [0.74, 0.20], [0.78, 0.40],
      [0.72, 0.64], [0.58, 0.84], [0.44, 0.92],
    ]),
  ],
};

/** Devuelve la plantilla o null si el dígito no existe (0-9). */
export function digitTemplate(digit: number): DigitTemplate | null {
  return DIGIT_TEMPLATES[digit] ?? null;
}
