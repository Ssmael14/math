import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Eye, Puzzle } from "lucide-react";
import {
  getActiveChild,
  getEnrollments,
  getLearningPathBySlug,
  getUnitsWithProgress,
} from "@/lib/queries";
import { brand } from "@/lib/brand";
import { TopNav } from "@/components/TopNav";
import { EnrollPathButton } from "./EnrollPathButton";
import { PathLessonMap } from "./PathLessonMap";

export const dynamic = "force-dynamic";

const pathLayoutVars = {
  "--path-gutter": "max(2rem, calc((100vw - 80rem) / 2 + 2rem))",
  "--path-sidebar-width": "500px",
  "--path-gap": "2rem",
  "--path-map-max": "684px",
  "--path-map-width":
    "min(var(--path-map-max), calc(100vw - var(--path-gutter) - var(--path-gutter) - var(--path-sidebar-width) - var(--path-gap)))",
  "--path-map-left":
    "calc(var(--path-gutter) + var(--path-sidebar-width) + var(--path-gap))",
  "--path-map-center":
    "calc(var(--path-map-left) + (var(--path-map-width) / 2))",
} as CSSProperties;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);

  if (!path) {
    return { title: `Camino no encontrado · ${brand.appName}` };
  }

  return {
    title: `${path.subject.name} · ${path.name} · ${brand.appName}`,
    description:
      path.description ??
      `Explora ${path.name} dentro de ${path.subject.name}.`,
  };
}

export default async function LearningPathPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);
  if (!path) notFound();

  const enrollments = await getEnrollments(child.id);
  const enrolled = enrollments.some(
    (enrollment) => enrollment.learningPathId === path.id,
  );
  const units = await getUnitsWithProgress(child.id, path.id);
  const currentUnit =
    units.find((unit) => unit.progress < 1) ?? units[0] ?? null;
  const currentLesson =
    units
      .flatMap((unit) =>
        unit.lessons.map((lesson) => ({
          ...lesson,
          unitTitle: unit.title,
        })),
      )
      .find((lesson) => lesson.status === "current") ?? null;
  const doneCount = units.filter((unit) => unit.progress >= 1).length;
  const progress = units.length ? doneCount / units.length : 0;
  const totalLessons = units.reduce((sum, unit) => sum + unit.lessonsTotal, 0);
  const totalDoneLessons = units.reduce(
    (sum, unit) => sum + unit.lessonsDone,
    0,
  );

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <TopNav fixed />

      <main className="flex-1 pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-[calc(4rem+env(safe-area-inset-top))]">
        <div
          className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8"
          style={pathLayoutVars}
        >
          <div className="grid gap-8 lg:grid-cols-[500px_1fr]">
            <section className="relative">
              <div className="rounded-3xl border border-slate-200 bg-white px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.04)] md:rounded-chunky md:px-9 md:py-9 lg:fixed lg:left-(--path-gutter) lg:top-[calc(6rem+env(safe-area-inset-top))] lg:w-[var(--path-sidebar-width)]">
                <div className="flex items-start gap-3 md:block">
                  <div className="relative h-14 w-14 shrink-0 md:mb-8 md:h-20 md:w-20">
                    <div className="absolute inset-0 rotate-[-7deg] rounded-2xl bg-[#4867f5] shadow-[0_10px_24px_rgba(72,103,245,0.24)]" />
                    <div className="absolute inset-2 rotate-[5deg] rounded-xl bg-[#6f87ff]" />
                    <div className="absolute left-0 top-5 h-4 w-4 rounded-r-full bg-white md:top-7 md:h-5 md:w-5" />
                    <div className="absolute -right-1 bottom-4 h-4 w-4 rounded-l-full bg-white md:bottom-5 md:h-5 md:w-5" />
                    <div className="absolute inset-0 flex items-center justify-center text-3xl md:text-4xl">
                      {path.subject.icon}
                    </div>
                    <div className="absolute -right-1.5 -top-1.5 h-4 w-4 rounded-full bg-white/90 md:-right-2 md:-top-2 md:h-6 md:w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h1 className="font-fredoka text-xl font-bold leading-tight tracking-tight text-slate-950 md:text-4xl">
                      {path.name}
                    </h1>
                    {path.description && (
                      <p className="mt-5 hidden max-w-sm text-base font-semibold leading-7 text-slate-500 md:block">
                        {path.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-black text-slate-950 md:mt-8 md:gap-5 md:text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" aria-hidden />
                    <span>{units.length} unidades</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Puzzle className="h-4 w-4" aria-hidden />
                    <span>{totalLessons} lecciones</span>
                  </div>
                </div>

                <div className="mt-4 md:mt-7">
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Avance</span>
                    <span>
                      {totalDoneLessons}/{totalLessons}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4867f5] transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 md:mt-6">
                  <EnrollPathButton
                    childId={child.id}
                    learningPathSlug={path.slug}
                    enrolled={enrolled}
                  />
                </div>
              </div>
            </section>

            <PathLessonMap
              units={units}
              initialLessonId={currentLesson?.id ?? null}
              childId={child.id}
              learningPathSlug={path.slug}
              enrolled={enrolled}
            />
          </div>

          {!currentUnit && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 text-center font-bold text-slate-500">
              Este camino todavía no tiene unidades disponibles.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
