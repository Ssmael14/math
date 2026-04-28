// app/victory/page.tsx
// Server component: lee la pantalla de victoria desde la DB para que las
// estrellas/XP no vengan de query params manipulables por el cliente.
import { redirect, notFound } from "next/navigation";
import { getActiveChild } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { VictoryView } from "./VictoryView";

export default async function VictoryPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { lessonId } = await searchParams;
  if (!lessonId) redirect("/home");

  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const progress = await prisma.progress.findUnique({
    where: { childId_lessonId: { childId: child.id, lessonId } },
    include: { lesson: { select: { xpReward: true, title: true } } },
  });

  if (!progress || !progress.completed) notFound();

  return <VictoryView xp={progress.lesson.xpReward} stars={progress.stars}/>;
}
