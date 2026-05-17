// lib/learning/trace-scoring.ts
// Scoring de trazado por COBERTURA de máscara — pensado para niños.
//
// La idea (técnica estándar en apps de trazado infantil): no comparamos
// punto-a-punto ni dirección ni cantidad de trazos. Rasterizamos:
//   - la "zona válida" = el dígito objetivo dibujado grueso (máscara)
//   - el dibujo del niño (todos sus trazos juntos, grueso)
// y medimos:
//   - coverage = cuánto de la máscara fue pintado por el niño
//   - spill    = cuánto del dibujo del niño cayó FUERA de la máscara
//
// Esto tolera temblores, tamaños distintos, multi-trazo y dirección libre.
//
// Esta capa es PURA y testeable: recibe los conteos de píxeles ya
// rasterizados (la rasterización vive en TraceCanvas, que tiene el canvas).

export type CoverageCounts = {
  /** Píxeles que forman la máscara del dígito objetivo. */
  maskCount: number;
  /** Píxeles dibujados por el niño que caen DENTRO de la máscara. */
  insideCount: number;
  /** Píxeles dibujados por el niño que caen FUERA de la máscara. */
  outsideCount: number;
};

export type TraceScore = {
  /** 0..1 — fracción de la máscara cubierta. */
  coverage: number;
  /** 0..1 — fracción del trazo que se salió del contorno. */
  spill: number;
  /** 0..1 — puntaje final combinado. */
  score: number;
  stars: 0 | 1 | 2 | 3;
  /** Conveniencia: ¿lo damos por bueno? (>= 1 estrella). */
  ok: boolean;
};

// Penaliza fuerte el "garabato" (pintar mucho fuera del número) sin castigar
// el desborde natural de una mano infantil que sigue el contorno.
const SPILL_PENALTY = 0.8;

/**
 * Combina coverage y spill en un score 0..1.
 *   score = coverage · (1 − SPILL_PENALTY · spill)
 * Generoso a propósito: con cubrir bien el número y no garabatear todo
 * alrededor, alcanza.
 */
export function scoreTrace(counts: CoverageCounts): TraceScore {
  const { maskCount, insideCount, outsideCount } = counts;

  if (maskCount <= 0) {
    return { coverage: 0, spill: 0, score: 0, stars: 0, ok: false };
  }

  const coverage = clamp01(insideCount / maskCount);
  const totalDrawn = insideCount + outsideCount;
  const spill = totalDrawn > 0 ? clamp01(outsideCount / totalDrawn) : 0;

  const score = clamp01(coverage * (1 - SPILL_PENALTY * spill));
  const stars = starsFromTraceScore(score);

  return { coverage, spill, score, stars, ok: stars >= 1 };
}

/**
 * Umbrales calibrados blandos para manos infantiles:
 *   ≥ 0.80 → 3 ⭐ (excelente)
 *   ≥ 0.62 → 2 ⭐ (bien)
 *   ≥ 0.42 → 1 ⭐ (aceptado, "casi")
 *   <  0.42 → 0 ⭐ (no cubrió el número)
 */
export function starsFromTraceScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 0.8) return 3;
  if (score >= 0.62) return 2;
  if (score >= 0.42) return 1;
  return 0;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
