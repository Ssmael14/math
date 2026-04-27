// app/home/page.tsx — Server Component con datos reales de la DB
import { redirect } from "next/navigation";
import { getActiveChild } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";
import { HomeClient } from "./HomeClient";

export default async function HomePage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  // Unidad activa: la primera con lecciones no completadas
  const unit = await prisma.unit.findFirst({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progress: { where: { childId: child.id } } },
      },
    },
  });

  if (!unit) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-cream">
        <TopNav/>
        <div className="p-8 text-center">
          <h1 className="font-fredoka text-2xl font-bold text-ink">Sin contenido</h1>
          <p className="text-ink-soft mt-2">Corré <code>npm run db:seed</code>.</p>
        </div>
      </div>
    );
  }

  let hitCurrent = false;
  const nodes = unit.lessons.map((l) => {
    const done = l.progress[0]?.completed ?? false;
    let status: "done" | "current" | "locked" = "locked";
    if (done) status = "done";
    else if (!hitCurrent) { status = "current"; hitCurrent = true; }
    return { id: l.id, label: l.title, status };
  });

  const totalDone = unit.lessons.filter((l) => l.progress[0]?.completed).length;
  const progressPct = unit.lessons.length ? totalDone / unit.lessons.length : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      <TopNav/>
      <HomeClient
        unit={{ title: unit.title, order: unit.order, progressPct }}
        nodes={nodes}
      />
    </div>
  );
}
