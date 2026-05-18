// lib/learning/teach.ts
// Lógica pura del "Momento Lumi" (paso de enseñanza no calificado).
//
// Un paso TEACH NO suma ni resta estrellas/XP: es enseñanza, no examen.
// Por eso el denominador de estrellas (cliente y servidor) debe contar
// solo los pasos calificados. Esta capa es pura y testeable.

import type { TeachContent } from "@/components/exercises/types";

/** ¿Este kind es enseñanza (no se califica)? */
export function isTeachKind(kind: string): boolean {
  return kind === "TEACH";
}

/** Cantidad de pasos calificados (excluye los TEACH). */
export function gradedCount(kinds: string[]): number {
  return kinds.filter((k) => !isTeachKind(k)).length;
}

/**
 * Valida y normaliza el payload de un TEACH. Devuelve null si está mal
 * formado (el runner entonces lo saltea sin romper la lección).
 */
export function parseTeach(payload: unknown): TeachContent | null {
  if (!payload || typeof payload !== "object") return null;
  const raw = (payload as { teach?: unknown }).teach;
  if (!raw || typeof raw !== "object") return null;

  const beatsRaw = (raw as { beats?: unknown }).beats;
  if (!Array.isArray(beatsRaw) || beatsRaw.length === 0) return null;

  const beats = beatsRaw
    .map((b) => {
      if (!b || typeof b !== "object") return null;
      const emoji = (b as { emoji?: unknown }).emoji;
      const text = (b as { text?: unknown }).text;
      if (typeof emoji !== "string" || typeof text !== "string" || !text.trim()) {
        return null;
      }
      const repeatRaw = (b as { repeat?: unknown }).repeat;
      const repeat =
        typeof repeatRaw === "number" && repeatRaw >= 1 && repeatRaw <= 20
          ? Math.floor(repeatRaw)
          : 1;
      return { emoji, text, repeat };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  if (beats.length === 0) return null;

  const tryItRaw = (raw as { tryIt?: unknown }).tryIt;
  let tryIt: TeachContent["tryIt"];
  if (tryItRaw && typeof tryItRaw === "object") {
    const emoji = (tryItRaw as { emoji?: unknown }).emoji;
    const count = (tryItRaw as { count?: unknown }).count;
    const text = (tryItRaw as { text?: unknown }).text;
    const successText = (tryItRaw as { successText?: unknown }).successText;
    if (
      typeof emoji === "string" &&
      typeof count === "number" &&
      count >= 1 &&
      count <= 20 &&
      typeof text === "string" &&
      typeof successText === "string"
    ) {
      tryIt = { emoji, count: Math.floor(count), text, successText };
    }
  }

  return { beats, tryIt };
}
