// app/lesson/[id]/page.tsx — corre ejercicios reales de una lección
import { redirect, notFound } from "next/navigation";
import { getActiveChild, getLessonExercises } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { LessonRunner } from "./LessonRunner";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) notFound();

  const exercises = await getLessonExercises(id);
  if (!exercises.length) notFound();

  return (
    <LessonRunner
      childId={child.id}
      hearts={child.hearts}
      lesson={{ id: lesson.id, title: lesson.title, xpReward: lesson.xpReward }}
      exercises={exercises.map((e) => ({
        id: e.id,
        kind: e.kind,
        prompt: e.prompt,
        payload: (e.payload ?? {}) as Record<string, unknown>,
        solution: (e.solution ?? {}) as { answer?: number | string; sequence?: (number | string)[]; pairs?: number[][] },
        hints: Array.isArray(e.hints) ? (e.hints as string[]) : null,
        explanation: e.explanation,
        audioUrl: e.audioUrl,
      }))}
    />
  );
}
