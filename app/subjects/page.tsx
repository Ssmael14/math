// app/subjects/page.tsx
// Catalogo de rutas de aprendizaje agrupadas por materia.
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { getActiveChild, getSubjectsPathCatalog } from "@/lib/queries";
import { TopNav } from "@/components/TopNav";

const accentByColor: Record<string, string> = {
  peach: "#ff8f70",
  mint: "#34c759",
  sky: "#4867f5",
  sun: "#ffc94a",
  lilac: "#8b5cf6",
  pink: "#ff5a78",
};

const pathIllustrations = [
  "artboard",
  "grid",
  "palette",
  "blocks",
  "book",
  "spark",
] as const;

function PathIllustration({
  variant,
}: {
  variant: (typeof pathIllustrations)[number];
}) {
  if (variant === "grid") {
    return (
      <div className="relative h-20 w-20 rounded-[22px] bg-[#86a0ff] shadow-[0_8px_0_#dfe5ff]">
        <div className="absolute inset-3 rounded-lg border-2 border-white/70" />
        <div className="absolute left-5 top-5 h-8 w-8 rounded-md border-2 border-[#ffd95c] bg-white/20" />
        <div className="absolute left-10 top-3 h-16 w-1.5 rotate-45 rounded-full bg-[#173bba]" />
        <div className="absolute bottom-4 right-3 h-7 w-1.5 -rotate-45 rounded-full bg-[#173bba]" />
      </div>
    );
  }

  if (variant === "palette") {
    return (
      <div className="relative h-20 w-20 rounded-full bg-[#6f87ff] shadow-[0_8px_0_#dfe5ff]">
        <div className="absolute left-5 top-5 h-4 w-4 rounded-full bg-[#ffd95c]" />
        <div className="absolute left-9 top-3 h-4 w-4 rounded-full bg-[#ffd95c]" />
        <div className="absolute left-8 top-10 h-6 w-8 rounded-full bg-[#ffe58a]" />
        <div className="absolute right-0 top-2 h-16 w-2 rotate-45 rounded-full bg-[#173bba]" />
      </div>
    );
  }

  if (variant === "blocks") {
    return (
      <div className="relative h-20 w-20">
        {[
          "left-1 top-10 bg-[#173bba]",
          "left-6 top-10 bg-[#4867f5]",
          "left-12 top-10 bg-[#4867f5]",
          "left-6 top-5 bg-[#6f87ff]",
          "left-12 top-5 bg-[#d7a900]",
          "left-12 top-0 bg-[#ffd95c]",
        ].map((className) => (
          <div
            key={className}
            className={`absolute h-7 w-7 rotate-45 rounded-md ${className}`}
          />
        ))}
      </div>
    );
  }

  if (variant === "book") {
    return (
      <div className="relative h-20 w-20 rounded-[22px] bg-[#b088db] shadow-[0_8px_0_#eadcff]">
        <div className="absolute left-4 top-4 h-12 w-9 rounded-lg bg-white/75" />
        <div className="absolute right-4 top-4 h-12 w-9 rounded-lg bg-white/55" />
        <div className="absolute left-1/2 top-3 h-14 w-1 -translate-x-1/2 rounded-full bg-[#3d2e4f]/30" />
      </div>
    );
  }

  if (variant === "spark") {
    return (
      <div className="relative h-20 w-20">
        <div className="absolute left-5 top-6 h-12 w-12 rotate-45 rounded-2xl bg-[#ff8fb1]" />
        <div className="absolute left-3 top-3 h-7 w-7 rounded-full bg-[#ffc94a]" />
        <div className="absolute right-2 top-1 h-10 w-2 rotate-45 rounded-full bg-[#173bba]" />
        <div className="absolute bottom-2 left-8 h-3 w-3 rounded-full bg-white" />
      </div>
    );
  }

  return (
    <div className="relative h-20 w-20">
      <div className="absolute left-5 top-4 h-16 w-12 rounded-sm bg-[#4867f5]" />
      <div className="absolute left-1 top-9 h-12 w-4 -rotate-45 rounded-sm bg-[#173bba]" />
      <div className="absolute right-2 top-8 h-9 w-9 rounded-sm bg-[#6f87ff]" />
      <div className="absolute left-2 top-2 h-8 w-8 rounded-full bg-[#86a0ff] shadow-[inset_0_0_0_3px_rgba(255,255,255,0.28)]" />
    </div>
  );
}

export default async function SubjectsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const subjects = await getSubjectsPathCatalog(child.id);
  const visibleSubjects = subjects.filter(
    (subject) => subject.learningPaths.length > 0 || subject.isActive,
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      <TopNav />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
          <header className="mb-14 md:mb-18">
            <h1 className="font-fredoka text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
              Caminos de aprendizaje
            </h1>
            <p className="mt-2 text-base font-semibold text-slate-500">
              Avanzá paso a paso con juegos visuales.
            </p>
          </header>

          <div className="space-y-12">
            {visibleSubjects.map((subject) => {
              const enabled =
                subject.isActive && subject.learningPaths.length > 0;
              const accent = accentByColor[subject.color] ?? "#4867f5";

              return (
                <section key={subject.id} aria-labelledby={`${subject.slug}-title`}>
                  <div className="mb-8 flex items-center gap-6">
                    <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
                      <PathIllustration
                        variant={
                          subject.slug === "math"
                            ? "artboard"
                            : subject.slug === "reading"
                              ? "book"
                              : "spark"
                        }
                      />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-center md:gap-8">
                      <h2
                        id={`${subject.slug}-title`}
                        className="font-fredoka text-xl font-bold text-slate-950 md:text-2xl"
                      >
                        {subject.name}
                      </h2>
                      {subject.description && (
                        <p className="max-w-xl text-sm font-semibold text-slate-500 md:text-base">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {enabled ? (
                    <div className="overflow-x-auto rounded-2xl bg-slate-50 px-6 py-10 md:px-8">
                      <div className="flex min-w-max gap-4 md:gap-5">
                        {subject.learningPaths.map((path, index) => {
                          const progressPct = Math.round(path.progress * 100);
                          const isNew = index === 0 && path.progress === 0;

                          return (
                            <Link
                              key={path.id}
                              href={`/paths/${path.slug}`}
                              className="group block w-44 shrink-0 md:w-48"
                            >
                              <div className="relative flex aspect-square items-center justify-center rounded-[22px] border-2 border-slate-200 bg-white shadow-[0_5px_0_#e5e7eb] transition-transform group-hover:-translate-y-1">
                                {isNew && (
                                  <span className="absolute right-3 top-3 rounded-full bg-[#16b84e] px-2.5 py-1 text-[11px] font-black uppercase text-white">
                                    New
                                  </span>
                                )}
                                {path.isPremium && (
                                  <span className="absolute left-3 top-3 rounded-full bg-[#ffc94a] px-2.5 py-1 text-[11px] font-black uppercase text-slate-950">
                                    Premium
                                  </span>
                                )}
                                <PathIllustration
                                  variant={
                                    pathIllustrations[
                                      index % pathIllustrations.length
                                    ]
                                  }
                                />
                                <div className="absolute inset-x-4 bottom-5 h-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${progressPct}%`,
                                      backgroundColor: accent,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="mt-6 text-center text-base font-semibold text-slate-950">
                                {path.name}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-50 px-6 py-8 text-sm font-bold text-slate-400">
                      <Lock className="mr-2 inline h-4 w-4" aria-hidden />
                      Próximamente
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
