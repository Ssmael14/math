import { prisma } from "@/lib/prisma";
import { EducationLevel } from "@prisma/client";

export type LessonAccessResult =
  | {
      ok: true;
      enrolled: true;
      alreadyCompleted: boolean;
      lesson: {
        id: string;
        xpReward: number;
        unit: {
          id: string;
          slug: string;
          learningPathId: string;
          learningPath: {
            slug: string;
            level: EducationLevel;
            isPremium: boolean;
          };
        };
      };
      isFreePreview: boolean;
    }
  | { ok: false; reason: "lesson_not_found" | "not_enrolled" | "locked" };

export async function getFreePreviewLessonId(learningPathId: string) {
  const firstUnit = await prisma.unit.findFirst({
    where: { learningPathId },
    orderBy: { order: "asc" },
    select: {
      lessons: {
        orderBy: { order: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  return firstUnit?.lessons[0]?.id ?? null;
}

export async function isFreePreviewLesson(
  learningPathId: string,
  lessonId: string,
) {
  const previewLessonId = await getFreePreviewLessonId(learningPathId);
  return previewLessonId === lessonId;
}

/**
 * Server-side lesson gate.
 *
 * UI locks are only hints; production APIs must verify that the child is
 * enrolled and that the requested lesson follows the path policy:
 * - INITIAL: strict, one lesson at a time.
 * - PRIMARY: current unit is open.
 * - SECONDARY/PREUNIVERSITY: enrolled path is open.
 */
export async function verifyLessonAccess(
  childId: string,
  lessonId: string,
): Promise<LessonAccessResult> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      xpReward: true,
      progresses: {
        where: { childId },
        select: { completed: true },
        take: 1,
      },
      unit: {
        select: {
          id: true,
          slug: true,
          learningPathId: true,
          learningPath: { select: { slug: true, level: true, isPremium: true } },
        },
      },
    },
  });

  if (!lesson) return { ok: false, reason: "lesson_not_found" };

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      childId_learningPathId: {
        childId,
        learningPathId: lesson.unit.learningPathId,
      },
    },
    select: { id: true },
  });

  if (!enrollment) return { ok: false, reason: "not_enrolled" };

  const isFreePreview = await isFreePreviewLesson(
    lesson.unit.learningPathId,
    lesson.id,
  );
  const alreadyCompleted = lesson.progresses[0]?.completed ?? false;
  if (alreadyCompleted) {
    return { ok: true, enrolled: true, alreadyCompleted, lesson, isFreePreview };
  }

  const level = lesson.unit.learningPath.level;
  if (level === EducationLevel.SECONDARY || level === EducationLevel.PREUNIVERSITY) {
    return { ok: true, enrolled: true, alreadyCompleted, lesson, isFreePreview };
  }

  const units = await prisma.unit.findMany({
    where: { learningPathId: lesson.unit.learningPathId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          unitId: true,
          progresses: {
            where: { childId },
            select: { completed: true },
            take: 1,
          },
        },
      },
    },
  });

  const lessonsInOrder = units.flatMap((unit) => unit.lessons);
  const firstIncomplete = lessonsInOrder.find(
    (entry) => !(entry.progresses[0]?.completed ?? false),
  );

  if (!firstIncomplete) {
    return { ok: false, reason: "locked" };
  }

  const allowed =
    level === EducationLevel.PRIMARY
      ? firstIncomplete.unitId === lesson.unit.id
      : firstIncomplete.id === lessonId;

  if (!allowed) {
    return { ok: false, reason: "locked" };
  }

  return { ok: true, enrolled: true, alreadyCompleted, lesson, isFreePreview };
}
