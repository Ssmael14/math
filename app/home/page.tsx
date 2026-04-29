// app/home/page.tsx — Server Component con datos reales de la DB.
//
// Selección de unidad activa:
//  1. Si vino `?unit=<slug>` y existe (y no está bloqueada por premium),
//     mostramos esa.
//  2. Si no, buscamos la primera unidad accesible con lecciones incompletas.
//  3. Si todas están completas, mostramos la primera (o la última que tenga).
import { redirect } from "next/navigation";
import { getActiveChild, getMasteryStats } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";
import { HomeClient } from "./HomeClient";

type UnitWithLessons = NonNullable<Awaited<ReturnType<typeof loadUnits>>>[number];

async function loadUnits(childId: string) {
  return prisma.unit.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progress: { where: { childId } } },
      },
    },
  });
}

function pickActiveUnit(units: UnitWithLessons[], requestedSlug: string | undefined): UnitWithLessons | null {
  if (units.length === 0) return null;

  if (requestedSlug) {
    const found = units.find((u) => u.slug === requestedSlug);
    if (found) return found;
  }

  // Primera con alguna lección incompleta.
  const incomplete = units.find((u) =>
    u.lessons.length === 0 || u.lessons.some((l) => !l.progress[0]?.completed),
  );
  if (incomplete) return incomplete;

  // Todo completo: caemos a la primera.
  return units[0];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { unit: requestedSlug } = await searchParams;

  const [units, masteryStats] = await Promise.all([
    loadUnits(child.id),
    getMasteryStats(child.id),
  ]);

  const unit = pickActiveUnit(units, requestedSlug);

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
        reviewsDue={masteryStats.dueToday}
      />
    </div>
  );
}
