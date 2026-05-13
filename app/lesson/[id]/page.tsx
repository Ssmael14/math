// app/lesson/[id]/page.tsx — corre ejercicios reales de una lección
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import {
  getActiveChild,
  getLessonById,
  getLessonExercises,
} from "@/lib/queries";
import { LessonRunner } from "./LessonRunner";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const lesson = await getLessonById(id);

  if (!lesson) {
    return { title: "Lección no encontrada · LearnMath" };
  }

  return {
    title: `${lesson.title} · ${lesson.unit.learningPath.subject.name} · LearnMath`,
    description:
      lesson.description ??
      `Lección de ${lesson.unit.title} dentro de ${lesson.unit.learningPath.name}.`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const lesson = await getLessonById(id);
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
        solution: (e.solution ?? {}) as {
          answer?: number | string;
          sequence?: (number | string)[];
          pairs?: number[][];
        },
        hints: Array.isArray(e.hints) ? (e.hints as string[]) : null,
        explanation: e.explanation,
      }))}
    />
  );
}
