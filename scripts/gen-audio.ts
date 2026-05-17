// scripts/gen-audio.ts
// Genera el audio (TTS) del enunciado de cada ejercicio UNA sola vez y guarda
// la URL en Exercise.audioUrl. Idempotente: hashea el prompt y solo regenera
// si el audio falta o el texto cambió. Cero costo/latencia en runtime.
//
//   npm run gen:audio            # solo los que faltan
//   npm run gen:audio -- --force # regenera todo
//
// Requiere en .env: ELEVENLABS_API_KEY (+ opcional ELEVENLABS_VOICE_ID /
// ELEVENLABS_MODEL_ID) y BLOB_READ_WRITE_TOKEN.

import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { elevenLabsConfigFromEnv, synthesize } from "../lib/tts/elevenlabs";
import { uploadToBlob } from "../lib/tts/blob";

const prisma = new PrismaClient();

function hashText(text: string): string {
  return createHash("sha1").update(text.trim()).digest("hex").slice(0, 16);
}

async function main() {
  const force = process.argv.includes("--force");

  const cfg = elevenLabsConfigFromEnv();
  if (!cfg) {
    console.error("✗ Falta ELEVENLABS_API_KEY en el entorno.");
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("✗ Falta BLOB_READ_WRITE_TOKEN en el entorno.");
    process.exit(1);
  }

  const exercises = await prisma.exercise.findMany({
    select: { id: true, prompt: true, audioUrl: true },
    orderBy: { createdAt: "asc" },
  });

  let generated = 0;
  let skipped = 0;

  for (const ex of exercises) {
    const text = ex.prompt?.trim();
    if (!text) {
      skipped++;
      continue;
    }
    const hash = hashText(text);
    const key = `tts/${hash}.mp3`;

    // Si la URL actual ya apunta a este hash, el texto no cambió → skip.
    if (!force && ex.audioUrl && ex.audioUrl.includes(`${hash}.mp3`)) {
      skipped++;
      continue;
    }

    try {
      const mp3 = await synthesize(text, cfg);
      const url = await uploadToBlob(key, mp3);
      await prisma.exercise.update({
        where: { id: ex.id },
        data: { audioUrl: url },
      });
      generated++;
      console.log(`✓ ${ex.id}  "${text.slice(0, 48)}"`);
    } catch (err) {
      console.error(`✗ ${ex.id}: ${(err as Error).message}`);
    }
  }

  console.log(`\nListo. Generados: ${generated} · Sin cambios: ${skipped}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
