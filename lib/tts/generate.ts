// lib/tts/generate.ts
// Lógica compartida de generación de audio (TTS) — la usan tanto el script
// batch (`npm run gen:audio`) como el endpoint admin (Fase C).
//
// Idempotente: hashea el prompt y solo regenera si el audio falta o el
// texto cambió. Nunca se ejecuta en el flujo del chico (solo batch/admin).

import { createHash } from "node:crypto";
import { prisma } from "../prisma";
import { elevenLabsConfigFromEnv, synthesize } from "./elevenlabs";
import { uploadToBlob } from "./blob";

export function hashText(text: string): string {
  return createHash("sha1").update(text.trim()).digest("hex").slice(0, 16);
}

export type GenAudioOptions = {
  /** Regenera aunque el hash coincida. */
  force?: boolean;
  /** Limita a un único ejercicio (botón "regenerar" del admin). */
  exerciseId?: string;
  /** Callback de progreso (el script lo usa para loguear). */
  onProgress?: (msg: string) => void;
};

export type GenAudioSummary = {
  generated: number;
  skipped: number;
  failed: number;
  errors: string[];
};

/** Falta alguna credencial para poder generar. Devuelve el motivo o null. */
export function genAudioMissingConfig(): string | null {
  if (!process.env.ELEVENLABS_API_KEY) return "ELEVENLABS_API_KEY";
  if (!process.env.BLOB_READ_WRITE_TOKEN) return "BLOB_READ_WRITE_TOKEN";
  return null;
}

export async function generateAudio(
  opts: GenAudioOptions = {},
): Promise<GenAudioSummary> {
  const { force = false, exerciseId, onProgress } = opts;
  const summary: GenAudioSummary = { generated: 0, skipped: 0, failed: 0, errors: [] };

  const cfg = elevenLabsConfigFromEnv();
  if (!cfg) {
    summary.errors.push("Falta ELEVENLABS_API_KEY");
    return summary;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    summary.errors.push("Falta BLOB_READ_WRITE_TOKEN");
    return summary;
  }

  const exercises = await prisma.exercise.findMany({
    where: exerciseId ? { id: exerciseId } : undefined,
    select: { id: true, prompt: true, audioUrl: true },
    orderBy: { createdAt: "asc" },
  });

  for (const ex of exercises) {
    const text = ex.prompt?.trim();
    if (!text) {
      summary.skipped++;
      continue;
    }
    const hash = hashText(text);
    const key = `tts/${hash}.mp3`;

    if (!force && ex.audioUrl && ex.audioUrl.includes(`${hash}.mp3`)) {
      summary.skipped++;
      continue;
    }

    try {
      const mp3 = await synthesize(text, cfg);
      const url = await uploadToBlob(key, mp3);
      await prisma.exercise.update({ where: { id: ex.id }, data: { audioUrl: url } });
      summary.generated++;
      onProgress?.(`✓ ${ex.id}  "${text.slice(0, 48)}"`);
    } catch (err) {
      summary.failed++;
      const msg = `${ex.id}: ${(err as Error).message}`;
      summary.errors.push(msg);
      onProgress?.(`✗ ${msg}`);
    }
  }

  return summary;
}
