// app/admin/audio/page.tsx
// Panel admin mínimo (Fase C): regenerar el audio TTS de los enunciados.
// Gate por email (ADMIN_EMAILS). Si no sos admin → 404 (no se revela).
import { notFound } from "next/navigation";
import { requireUser, isAdminEmail } from "@/lib/auth/server";
import { genAudioMissingConfig } from "@/lib/tts/generate";
import { prisma } from "@/lib/prisma";
import { AudioAdminClient } from "./AudioAdminClient";

export const dynamic = "force-dynamic";

export default async function AudioAdminPage() {
  const user = await requireUser();
  if (!isAdminEmail(user.email)) notFound();

  const [total, withAudio] = await Promise.all([
    prisma.exercise.count(),
    prisma.exercise.count({ where: { NOT: { audioUrl: null } } }),
  ]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink mb-1">
        Audio de enunciados
      </h1>
      <p className="text-sm text-ink-soft mb-6">
        Genera el TTS (ElevenLabs) de los enunciados y lo guarda en Vercel
        Blob. Idempotente: solo regenera lo que falta o cambió.
      </p>

      <AudioAdminClient
        total={total}
        withAudio={withAudio}
        missingConfig={genAudioMissingConfig()}
      />
    </main>
  );
}
