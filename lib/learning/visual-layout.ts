// lib/visual-layout.ts
// Helpers puros para layout visual de ejercicios COUNT — separados acá para
// que sean testeables sin parser JSX.

/**
 * Cantidad de columnas óptima para mostrar `count` ítems en filas parejas.
 *  1-3 → 1 fila completa
 *  4   → 2x2
 *  5-6 → 3 col x 2 filas
 *  7-8 → 4 col x 2 filas
 *  9   → 3x3
 *  10+ → 5 col
 */
export function countCols(count: number): number {
  if (count <= 3) return count;
  if (count === 4) return 2;
  if (count <= 6) return 3;
  if (count <= 8) return 4;
  if (count === 9) return 3;
  return 5;
}

/**
 * Tamaño de emoji según cuántos ítems hay. Para counts grandes bajamos
 * el tamaño así entra en pantallas chicas (~375px). Pareja mobile/desktop.
 */
export function countSizeCls(count: number): string {
  if (count <= 4) return "text-5xl md:text-7xl";
  if (count <= 6) return "text-4xl md:text-6xl";
  if (count <= 9) return "text-3xl md:text-5xl";
  return "text-2xl md:text-4xl";
}
