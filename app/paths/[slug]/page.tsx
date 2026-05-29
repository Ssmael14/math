import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Eye, Puzzle, Sparkles } from "lucide-react";
import {
  getActiveChild,
  getEnrollments,
  getLearningPathBySlug,
  getUnitsWithProgress,
} from "@/lib/queries";
import { TopNav } from "@/components/TopNav";
import { EnrollPathButton } from "./EnrollPathButton";
import { ScrollToCurrentLesson } from "./ScrollToCurrentLesson";

export const dynamic = "force-dynamic";

const nodePositions = [
  "md:ml-8",
  "md:-ml-16",
  "md:ml-12",
  "md:-ml-4",
  "md:ml-20",
  "md:-ml-12",
];

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

function lessonNodeClasses({
  isDone,
  isCurrent,
  isLocked,
  position,
}: {
  isDone: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  position: string;
}) {
  return `group relative flex items-center gap-5 self-center ${position} ${
    isCurrent ? "cursor-pointer" : "cursor-default"
  } ${isCurrent ? "scroll-mt-40 scroll-mb-56" : ""} ${
    isLocked || isDone ? "select-none" : ""
  }`;
}

function LessonNodeShell({
  href,
  disabled,
  current,
  className,
  children,
}: {
  href: string;
  disabled: boolean;
  current: boolean;
  className: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <div
        aria-disabled="true"
        data-current-lesson={current ? true : undefined}
        className={className}
      >
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      aria-current={current ? "step" : undefined}
      data-current-lesson={current ? true : undefined}
      className={className}
    >
      {children}
    </Link>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = await getLearningPathBySlug(slug);

  if (!path) {
    return { title: "Camino no encontrado · LearnMath" };
  }

  return {
    title: `${path.subject.name} · ${path.name} · LearnMath`,
    description:
      path.description ??
      `Explorá ${path.name} dentro de ${path.subject.name}.`,
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
  const startHref = currentLesson ? `/lesson/${currentLesson.id}` : "#";

  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <TopNav fixed />
      <ScrollToCurrentLesson />

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

            <section className="relative pb-56 lg:w-[var(--path-map-width)] lg:justify-self-center">
              <div
                className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-linear-to-b from-transparent via-slate-200 to-transparent md:block"
                aria-hidden
              />

              <div className="relative px-1 pb-8 pt-1">
                <div className="relative mx-auto flex max-w-[620px] flex-col">
                  {units.map((unit) => (
                    <section
                      key={unit.id}
                      className="relative min-h-[calc(100dvh-5rem)] scroll-mt-28 pb-36 pt-2 first:pt-0 last:pb-64"
                    >
                      <div className="sticky top-[calc(5rem+env(safe-area-inset-top))] -mx-4 mb-10 bg-linear-to-b from-white via-white to-white/0 px-4 pb-5 pt-3">
                        <Link
                          href={`/units/${unit.slug}`}
                          className="mx-auto flex min-h-17.5 max-w-115 items-center justify-center rounded-2xl border-2 border-[#6d86ff] bg-white/95 px-6 text-center font-fredoka text-lg font-bold text-[#2445d8] shadow-[0_5px_0_#6d86ff] backdrop-blur"
                        >
                          {unit.title}
                        </Link>
                      </div>

                      <div className="relative flex flex-col gap-10 md:gap-14">
                        {unit.lessons.map((lesson, lessonIndex) => {
                          const isDone = lesson.status === "done";
                          const isCurrent = lesson.status === "current";
                          const isLocked = lesson.status === "locked";
                          const href = `/lesson/${lesson.id}`;
                          const position =
                            nodePositions[lessonIndex % nodePositions.length];
                          const nodeClassName = lessonNodeClasses({
                            isDone,
                            isCurrent,
                            isLocked,
                            position,
                          });

                          return (
                            <LessonNodeShell
                              key={lesson.id}
                              href={href}
                              disabled={isLocked || isDone}
                              current={isCurrent}
                              className={nodeClassName}
                            >
                              <div
                                className={`relative flex h-[68px] w-[92px] scroll-mt-40 scroll-mb-56 items-center justify-center rounded-full transition-transform ${
                                  isCurrent
                                    ? "animate-pulse-soft group-hover:scale-105"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`absolute inset-x-3 bottom-0 h-12 rounded-[50%] ${
                                    isLocked
                                      ? "bg-slate-300"
                                      : isDone
                                        ? "bg-[#5d7cf5]"
                                        : "bg-[#4669ff]"
                                  }`}
                                />
                                <div
                                  className={`absolute inset-x-5 bottom-2 h-9 rounded-[50%] border-[6px] ${
                                    isLocked
                                      ? "border-slate-200 bg-slate-100"
                                      : "border-[#dce4ff] bg-[#97aaff]"
                                  }`}
                                />
                                <div
                                  className={`absolute bottom-4 flex h-8 w-12 items-center justify-center rounded-[50%] ${
                                    isLocked
                                      ? "bg-slate-200 text-slate-500"
                                      : "bg-white text-[#4867f5]"
                                  }`}
                                >
                                  {isDone ? (
                                    <span className="text-lg font-black">
                                      ✓
                                    </span>
                                  ) : isLocked ? (
                                    <span className="text-base" aria-hidden>
                                      🔒
                                    </span>
                                  ) : (
                                    <Sparkles className="h-5 w-5" aria-hidden />
                                  )}
                                </div>
                                {isCurrent && (
                                  <div className="absolute -top-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#34c759] text-white shadow-[0_10px_20px_rgba(52,199,89,0.25)]">
                                    <span className="text-2xl" aria-hidden>
                                      {unit.icon ?? "🧩"}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div
                                className={`min-w-[190px] text-sm font-bold leading-6 ${
                                  isLocked
                                    ? "text-slate-300"
                                    : isDone
                                      ? "text-slate-400"
                                      : "text-slate-950"
                                }`}
                              >
                                <div className="font-fredoka text-base">
                                  {lesson.title}
                                </div>
                                <div className="text-xs font-black uppercase tracking-wider text-slate-300">
                                  {isDone
                                    ? "Completada"
                                    : isCurrent
                                      ? "Continuar acá"
                                      : "Bloqueada"}
                                </div>
                              </div>
                            </LessonNodeShell>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>

              {currentLesson && (
                <div className="fixed inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-[460px] rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(72,103,245,0.16)] lg:inset-x-auto lg:left-[var(--path-map-center)] lg:w-[min(460px,var(--path-map-width))] lg:-translate-x-1/2">
                  <div className="mb-4 text-center font-fredoka text-xl font-bold text-slate-950">
                    {currentLesson.title}
                  </div>
                  <div className="-mt-2 mb-4 text-center text-xs font-black uppercase tracking-wider text-slate-300">
                    {currentLesson.unitTitle}
                  </div>
                  <Link
                    href={startHref}
                    className="btn-chunky block w-full rounded-2xl bg-[#4867f5] px-6 py-4 text-center text-base font-black text-white shadow-[0_5px_0_#2445d8] hover:bg-[#3d5df0]"
                  >
                    Start
                  </Link>
                </div>
              )}
            </section>
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
