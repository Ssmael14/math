"use client";
// Wrapper específico de "lección normal" sobre el ExerciseRunner compartido.
// Al terminar, sube el resultado a /api/progress y redirige a /victory.
import { useRouter } from "next/navigation";
import { ExerciseRunner } from "@/components/exercises/ExerciseRunner";
import type { ExerciseDTO } from "@/components/exercises/types";
import { postOrQueue } from "@/lib/offline-queue";

export function LessonRunner({
  childId, hearts, lesson, exercises,
}: {
  childId: string;
  hearts: number;
  lesson: { id: string; title: string; xpReward: number };
  exercises: ExerciseDTO[];
}) {
  const router = useRouter();

  return (
    <ExerciseRunner
      childId={childId}
      hearts={hearts}
      exercises={exercises}
      xpPerExercise={Math.round(lesson.xpReward / Math.max(1, exercises.length))}
      reviewMode={false}
      labels={{ step: "EJERCICIO", idle: "¡Tú puedes! Elegí tu respuesta." }}
      onComplete={async ({ correctCount }) => {
        await postOrQueue("/api/progress", { childId, lessonId: lesson.id, correctCount });
        router.push(`/victory?lessonId=${lesson.id}`);
      }}
    />
  );
}
