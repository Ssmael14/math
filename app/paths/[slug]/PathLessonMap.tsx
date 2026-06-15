"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";

const nodePositions = [
  "md:ml-8",
  "md:-ml-16",
  "md:ml-12",
  "md:-ml-4",
  "md:ml-20",
  "md:-ml-12",
];

type LessonStatus = "done" | "current" | "available" | "locked";

type MapLesson = {
  id: string;
  slug: string;
  title: string;
  order: number;
  stars: number;
  status: LessonStatus;
  isFreePreview?: boolean;
  isPremiumLocked?: boolean;
};

type MapUnit = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  progress: number;
  lessonsTotal: number;
  lessonsDone: number;
  lessons: MapLesson[];
};

type SelectableLesson = MapLesson & {
  unitTitle: string;
  unitIcon: string | null;
};

function lessonNodeClasses({
  isSelected,
  isCurrent,
  isLocked,
  isPlayable,
  position,
}: {
  isSelected: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  isPlayable: boolean;
  position: string;
}) {
  return `group relative flex items-center gap-5 self-center ${position} ${
    isPlayable ? "cursor-pointer" : "cursor-default"
  } ${isCurrent ? "scroll-mt-40 scroll-mb-56" : ""} ${
    isLocked ? "select-none" : ""
  } ${isSelected ? "rounded-3xl bg-[#eef3ff] px-3 py-2 ring-2 ring-[#6d86ff]/25" : ""}`;
}

function ctaLabel(lesson: SelectableLesson) {
  if (lesson.isFreePreview) {
    return lesson.status === "done" ? "Repasar gratis" : "Probar gratis";
  }
  if (lesson.status === "done") return "Repasar";
  if (lesson.status === "available") return "Empezar";
  return "Start";
}

export function PathLessonMap({
  units,
  initialLessonId,
  childId,
  learningPathSlug,
  enrolled,
}: {
  units: MapUnit[];
  initialLessonId: string | null;
  childId: string;
  learningPathSlug: string;
  enrolled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const selectableLessons = useMemo(
    () =>
      units.flatMap((unit) =>
        unit.lessons
          .filter(
            (lesson) => lesson.status !== "locked" && !lesson.isPremiumLocked,
          )
          .map((lesson) => ({
            ...lesson,
            unitTitle: unit.title,
            unitIcon: unit.icon,
          })),
      ),
    [units],
  );
  const fallbackLesson = selectableLessons[0] ?? null;
  const [selectedLessonId, setSelectedLessonId] = useState(
    initialLessonId ?? fallbackLesson?.id ?? null,
  );
  const selectedLesson =
    selectableLessons.find((lesson) => lesson.id === selectedLessonId) ??
    fallbackLesson;
  const hasPremiumLockedLessons = units.some((unit) =>
    unit.lessons.some((lesson) => lesson.isPremiumLocked),
  );
  const shouldShowPremiumCta =
    hasPremiumLockedLessons &&
    selectableLessons.length === 1 &&
    selectableLessons[0]?.isFreePreview &&
    selectableLessons[0]?.status === "done";

  function openSelectedLesson() {
    if (!selectedLesson || pending) return;
    setError(null);

    if (shouldShowPremiumCta) {
      router.push("/premium");
      return;
    }

    startTransition(async () => {
      if (!enrolled) {
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ childId, learningPathSlug }),
        });

        if (response.status === 402) {
          setError("premium_required");
          return;
        }

        if (!response.ok) {
          setError("No pudimos empezar este camino. Prueba de nuevo.");
          return;
        }

        router.refresh();
      }

      router.push(`/lesson/${selectedLesson.id}`);
    });
  }

  useEffect(() => {
    const currentLesson = document.querySelector<HTMLElement>(
      "[data-current-lesson]",
    );
    if (!currentLesson) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const frame = window.requestAnimationFrame(() => {
      currentLesson.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
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
                  const isAvailable = lesson.status === "available";
                  const isPremiumLocked = lesson.isPremiumLocked === true;
                  const isLocked = lesson.status === "locked" || isPremiumLocked;
                  const isPlayable =
                    !isLocked && (isDone || isCurrent || isAvailable);
                  const isSelected = selectedLesson?.id === lesson.id;
                  const position =
                    nodePositions[lessonIndex % nodePositions.length];
                  const nodeClassName = lessonNodeClasses({
                    isSelected,
                    isCurrent,
                    isLocked,
                    isPlayable,
                    position,
                  });

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      disabled={isLocked}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-pressed={isSelected}
                      data-current-lesson={isCurrent ? true : undefined}
                      onClick={() => {
                        if (isPlayable) setSelectedLessonId(lesson.id);
                      }}
                      className={nodeClassName}
                    >
                      <span
                        className={`relative flex h-[68px] w-[92px] scroll-mb-56 scroll-mt-40 items-center justify-center rounded-full transition-transform ${
                          isCurrent
                            ? "animate-pulse-soft group-hover:scale-105"
                            : isAvailable || isDone
                              ? "group-hover:scale-105"
                              : ""
                        }`}
                      >
                        <span
                          className={`absolute inset-x-3 bottom-0 h-12 rounded-[50%] ${
                            isLocked
                              ? "bg-slate-300"
                              : isDone
                                ? "bg-[#5d7cf5]"
                                : "bg-[#4669ff]"
                          }`}
                        />
                        <span
                          className={`absolute inset-x-5 bottom-2 h-9 rounded-[50%] border-[6px] ${
                            isLocked
                              ? "border-slate-200 bg-slate-100"
                              : "border-[#dce4ff] bg-[#97aaff]"
                          }`}
                        />
                        <span
                          className={`absolute bottom-4 flex h-8 w-12 items-center justify-center rounded-[50%] ${
                            isLocked
                              ? "bg-slate-200 text-slate-500"
                              : "bg-white text-[#4867f5]"
                          }`}
                        >
                          {isDone ? (
                            <span className="text-lg font-black">✓</span>
                          ) : isLocked ? (
                            <span className="text-base" aria-hidden>
                              🔒
                            </span>
                          ) : (
                            <Sparkles className="h-5 w-5" aria-hidden />
                          )}
                        </span>
                        {isCurrent && (
                          <span className="absolute -top-5 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#34c759] text-white shadow-[0_10px_20px_rgba(52,199,89,0.25)]">
                            <span className="text-2xl" aria-hidden>
                              {unit.icon ?? "🧩"}
                            </span>
                          </span>
                        )}
                      </span>

                      <span
                        className={`min-w-[190px] text-left text-sm font-bold leading-6 ${
                          isLocked
                            ? "text-slate-300"
                            : isDone
                              ? "text-slate-400"
                              : "text-slate-950"
                        }`}
                      >
                        <span className="block font-fredoka text-base">
                          {lesson.title}
                        </span>
                        <span className="block text-xs font-black uppercase tracking-wider text-slate-300">
                          {isDone
                            ? "Completada"
                            : isPremiumLocked
                              ? "Premium"
                              : lesson.isFreePreview
                                ? "Prueba gratis"
                            : isCurrent
                              ? "Continuar aquí"
                              : isAvailable
                                ? "Disponible"
                                : "Bloqueada"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selectedLesson && (
        <div className="fixed inset-x-4 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 mx-auto max-w-[460px] rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(72,103,245,0.16)] lg:inset-x-auto lg:left-[var(--path-map-center)] lg:w-[min(460px,var(--path-map-width))] lg:-translate-x-1/2">
          <div className="mb-4 text-center font-fredoka text-xl font-bold text-slate-950">
            {selectedLesson.title}
          </div>
          <div className="-mt-2 mb-4 text-center text-xs font-black uppercase tracking-wider text-slate-300">
            {selectedLesson.unitTitle}
          </div>
          {error && (
            <div className="mb-3 text-center text-sm font-bold text-pink">
              {error === "premium_required" ? (
                <>
                  Desbloquea Premium para seguir.{" "}
                  <Link href="/premium" className="underline">
                    Ver activación
                  </Link>
                </>
              ) : (
                error
              )}
            </div>
          )}
          {shouldShowPremiumCta && (
            <div className="mb-3 rounded-2xl bg-[#fff4cc] px-4 py-3 text-center text-sm font-black text-slate-700">
              Ya probaste la lección gratis. Desbloquea Premium para seguir.
            </div>
          )}
          <button
            type="button"
            onClick={openSelectedLesson}
            disabled={pending}
            className="btn-chunky block w-full rounded-2xl bg-[#4867f5] px-6 py-4 text-center text-base font-black text-white shadow-[0_5px_0_#2445d8] hover:bg-[#3d5df0] disabled:opacity-60"
          >
            {shouldShowPremiumCta
              ? "Desbloquear curso"
              : pending
              ? "Cargando..."
              : enrolled
                ? ctaLabel(selectedLesson)
                : selectedLesson.isFreePreview
                  ? "Probar gratis"
                  : "Empezar este camino"}
          </button>
        </div>
      )}
    </section>
  );
}
