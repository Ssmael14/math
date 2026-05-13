// app/review/page.tsx
// Modo "Repaso del día" — corre los ejercicios cuya review SRS está vencida.
// Usa el mismo ExerciseRunner que las lecciones pero sin XP/stars y sin
// descontar corazones (vía reviewMode=true).
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveChild, getReviewQueue } from "@/lib/queries";
import { ReviewRunner } from "./ReviewRunner";

export default async function ReviewPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const queue = await getReviewQueue(child.id, 10);

  if (queue.length === 0) {
    return <NothingToReview/>;
  }

  return (
    <ReviewRunner
      childId={child.id}
      hearts={child.hearts}
      exercises={queue.map((m) => ({
        id: m.exercise.id,
        kind: m.exercise.kind,
        prompt: m.exercise.prompt,
        payload: (m.exercise.payload ?? {}) as Record<string, unknown>,
        solution: (m.exercise.solution ?? {}) as { answer?: number | string; sequence?: (number | string)[]; pairs?: number[][] },
        hints: Array.isArray(m.exercise.hints) ? (m.exercise.hints as string[]) : null,
        explanation: m.exercise.explanation,
      }))}
    />
  );
}

function NothingToReview() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cream px-6 py-8 text-center">
      <div className="text-7xl mb-4">🎉</div>
      <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mb-2">
        Nada por repasar hoy
      </h1>
      <p className="text-ink-soft max-w-sm mb-6">
        Volvé mañana — Lumi te avisa cuándo hay ejercicios para refrescar.
      </p>
      <Link
        href="/home"
        className="btn-chunky py-3 px-8 rounded-full bg-ink text-white font-black uppercase tracking-wide text-sm"
        style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.25)" }}
      >
        Ir al inicio
      </Link>
    </div>
  );
}
