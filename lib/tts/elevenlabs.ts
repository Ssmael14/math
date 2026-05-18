// lib/tts/elevenlabs.ts
// Adapter de ElevenLabs — SOLO se usa desde el script batch `gen:audio`,
// NUNCA en runtime (sin costo ni latencia para el chico).
//
// Genera el mp3 del enunciado con una voz fija y cálida ("Lumi"). El script
// hashea el texto y solo llama acá si el audio falta o el texto cambió.

const API = "https://api.elevenlabs.io/v1/text-to-speech";

export type ElevenLabsConfig = {
  apiKey: string;
  voiceId: string;
  modelId: string;
};

export function elevenLabsConfigFromEnv(): ElevenLabsConfig | null {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    // Voz por defecto: "Rachel" (multilingüe). Sobreescribible por env.
    voiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
    modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2",
  };
}

/** Sintetiza `text` y devuelve el mp3 como Buffer. Lanza si la API falla. */
export async function synthesize(
  text: string,
  cfg: ElevenLabsConfig,
): Promise<Buffer> {
  const res = await fetch(`${API}/${cfg.voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": cfg.apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: cfg.modelId,
      // Tono estable y cercano para chicos.
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.2 },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}
