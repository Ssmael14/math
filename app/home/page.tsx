// app/home/page.tsx — Mapa de unidades del LearningPath activo.
//
// Selección del path:
//   1. Si vino ?path=<slug>, el caller fuerza ese (y se setea la cookie
//      `lm_path` vía /api/enrollments cuando se inscribe).
//   2. Sino, el path activo del child (cookie `lm_path` o enrollment más
//      reciente — ver getActiveEnrollment).
//   3. Sino → redirect a /subjects (el child todavía no eligió materia).
//
// Selección de unidad dentro del path:
//   1. Si vino ?unit=<slug>, esa.
//   2. Sino, la primera con lecciones incompletas.
//   3. Sino, la primera disponible.
import { redirect } from "next/navigation";
import {
  getActiveChild,
  getActiveEnrollment,
  getLearningPathBySlug,
  getMasteryStats,
} from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";
import { HomeClient } from "./HomeClient";

type UnitWithLessons = NonNullable<
  Awaited<ReturnType<typeof loadUnits>>
>[number];

async function loadUnits(childId: string, learningPathId: string) {
  return prisma.unit.findMany({
    where: { learningPathId },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: { progresses: { where: { childId } } },
      },
    },
  });
}

function pickActiveUnit(
  units: UnitWithLessons[],
  requestedSlug: string | undefined,
): UnitWithLessons | null {
  if (units.length === 0) return null;
  if (requestedSlug) {
    const found = units.find((u) => u.slug === requestedSlug);
    if (found) return found;
  }
  const incomplete = units.find(
    (u) =>
      u.lessons.length === 0 ||
      u.lessons.some((l) => !l.progresses[0]?.completed),
  );
  return incomplete ?? units[0];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string; path?: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { unit: requestedUnitSlug, path: requestedPathSlug } =
    await searchParams;

  // Elegir LearningPath: query > enrollment activo. Sin enrollment → /subjects.
  let activePath = null;
  if (requestedPathSlug) {
    activePath = await getLearningPathBySlug(requestedPathSlug);
  }
  if (!activePath) {
    const enrollment = await getActiveEnrollment(child.id);
    if (!enrollment) {
      redirect("/subjects");
    }
    activePath = enrollment.learningPath;
  }

  const [units, masteryStats] = await Promise.all([
    loadUnits(child.id, activePath.id),
    getMasteryStats(child.id),
  ]);

  const unit = pickActiveUnit(units, requestedUnitSlug);

  if (!unit) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-cream">
        <TopNav />
        <div className="p-8 text-center">
          <h1 className="font-fredoka text-2xl font-bold text-ink">
            Path sin unidades
          </h1>
          <p className="text-ink-soft mt-2">
            El path "{activePath.name}" no tiene unidades cargadas.
          </p>
        </div>
      </div>
    );
  }

  let hitCurrent = false;
  const nodes = unit.lessons.map((l) => {
    const done = l.progresses[0]?.completed ?? false;
    let status: "done" | "current" | "locked" = "locked";
    if (done) status = "done";
    else if (!hitCurrent) {
      status = "current";
      hitCurrent = true;
    }
    return { id: l.id, label: l.title, status };
  });

  const totalDone = unit.lessons.filter(
    (l) => l.progresses[0]?.completed,
  ).length;
  const progressPct = unit.lessons.length ? totalDone / unit.lessons.length : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      <TopNav />
      <HomeClient
        unit={{ title: unit.title, order: unit.order, progressPct }}
        nodes={nodes}
        reviewsDue={masteryStats.dueToday}
        pathHref={`/paths/${activePath.slug}`}
      />
    </div>
  );
}
