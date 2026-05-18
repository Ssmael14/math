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

import { prisma } from "../lib/prisma";
import { generateAudio, genAudioMissingConfig } from "../lib/tts/generate";

async function main() {
  const missing = genAudioMissingConfig();
  if (missing) {
    console.error(`✗ Falta ${missing} en el entorno.`);
    process.exit(1);
  }

  const force = process.argv.includes("--force");
  const summary = await generateAudio({
    force,
    onProgress: (msg) => console.log(msg),
  });

  console.log(
    `\nListo. Generados: ${summary.generated} · Sin cambios: ${summary.skipped} · Fallaron: ${summary.failed}`,
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
