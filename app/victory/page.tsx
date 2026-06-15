// app/victory/page.tsx
// Server component: lee la pantalla de victoria desde la DB para que las
// estrellas/XP no vengan de query params manipulables por el cliente.
import { redirect, notFound } from "next/navigation";
import { getActiveChild } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/server";
import { hasPremiumAccess } from "@/lib/premium";
import { isFreePreviewLesson } from "@/lib/learning/lesson-access";
import { VictoryView } from "./VictoryView";

export const dynamic = "force-dynamic";

export default async function VictoryPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { lessonId } = await searchParams;
  if (!lessonId) redirect("/home");

  const child = await getActiveChild();
  if (!child) redirect("/profile/create");
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const progress = await prisma.progress.findUnique({
    where: { childId_lessonId: { childId: child.id, lessonId } },
    include: {
      lesson: {
        select: {
          xpReward: true,
          title: true,
          unit: {
            select: {
              slug: true,
              learningPathId: true,
              learningPath: { select: { slug: true, isPremium: true } },
            },
          },
        },
      },
    },
  });

  if (!progress || !progress.completed) notFound();

  // Volvemos al mapa del camino completo, donde ahora se muestran unidades y
  // lecciones juntas. La pantalla /units/[slug] queda como detalle/fallback.
  const continueHref = `/paths/${progress.lesson.unit.learningPath.slug}`;
  const completedFreePreview = await isFreePreviewLesson(
    progress.lesson.unit.learningPathId,
    lessonId,
  );
  const shouldPitchPremium =
    progress.lesson.unit.learningPath.isPremium &&
    completedFreePreview &&
    !hasPremiumAccess(user);

  return (
    <VictoryView
      xp={progress.attemptsCount === 1 ? progress.lesson.xpReward : 0}
      stars={progress.stars}
      continueHref={shouldPitchPremium ? "/premium" : continueHref}
      continueLabel={shouldPitchPremium ? "Desbloquear curso" : "Continuar"}
      secondaryHref={shouldPitchPremium ? continueHref : undefined}
      secondaryLabel={shouldPitchPremium ? "Ver mapa" : undefined}
      message={
        shouldPitchPremium
          ? "Probaste la primera lección gratis. Activa Premium para seguir con el curso completo."
          : undefined
      }
    />
  );
}
