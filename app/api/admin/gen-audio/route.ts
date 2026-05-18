// app/api/admin/gen-audio/route.ts
// POST /api/admin/gen-audio — regenera el audio (TTS) de los enunciados.
// Fase C: lo dispara el panel admin mínimo. Gate por email (ADMIN_EMAILS),
// aún no hay modelo de roles. Nunca lo toca el flujo del chico.
//
// Body opcional: { force?: boolean, exerciseId?: string }
import { NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth/server";
import { rateLimit } from "@/lib/rate-limit";
import { generateAudio, genAudioMissingConfig } from "@/lib/tts/generate";

// La síntesis puede tardar: damos margen amplio.
export const maxDuration = 300;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const limited = rateLimit(`gen-audio:${user.id}`, 5, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const missing = genAudioMissingConfig();
  if (missing) {
    return NextResponse.json(
      { error: "missing_config", detail: missing },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;
  const exerciseId = typeof body?.exerciseId === "string" ? body.exerciseId : undefined;

  const summary = await generateAudio({ force, exerciseId });
  return NextResponse.json(summary);
}
