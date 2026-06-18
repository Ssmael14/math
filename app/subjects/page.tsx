// app/subjects/page.tsx
// Catalogo de rutas de aprendizaje agrupadas por materia.
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Lock, Play } from "lucide-react";
import { getActiveChild, getSubjectsPathCatalog } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth/server";
import { hasPremiumAccess } from "@/lib/premium";
import { TopNav } from "@/components/TopNav";
import { brand } from "@/lib/brand";

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

type SubjectCatalog = Awaited<ReturnType<typeof getSubjectsPathCatalog>>[number];
type PathCatalog = SubjectCatalog["learningPaths"][number];
type PathEntry = {
  subject: SubjectCatalog;
  path: PathCatalog;
  accent: string;
  illustration: (typeof pathIllustrations)[number];
};

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

function CatalogIcon({
  entry,
  className = "h-20 w-20",
}: {
  entry: PathEntry;
  className?: string;
}) {
  if (entry.path.level === "INITIAL" && entry.subject.slug === "math") {
    if (entry.path.slug === "math-number-tracing") {
      return (
        <Image
          src={brand.assets.pathNumberTracing}
          alt=""
          width={180}
          height={180}
          className={`${className} object-contain`}
          aria-hidden
        />
      );
    }

    return (
      <Image
        src={brand.assets.pathMathInitial}
        alt=""
        width={180}
        height={180}
        className={`${className} object-contain`}
        aria-hidden
      />
    );
  }

  if (entry.path.slug === "math-primary-1") {
    return (
      <Image
        src={brand.assets.pathMathPrimary1}
        alt=""
        width={180}
        height={180}
        className={`${className} object-contain`}
        aria-hidden
      />
    );
  }

  if (entry.path.level === "INITIAL" && entry.subject.slug === "reading") {
    return (
      <Image
        src={brand.assets.pathReadingInitial}
        alt=""
        width={180}
        height={180}
        className={`${className} object-contain`}
        aria-hidden
      />
    );
  }

  return <PathIllustration variant={entry.illustration} />;
}

function SubjectIcon({
  subject,
}: {
  subject: SubjectCatalog;
}) {
  if (subject.slug === "math") {
    return (
      <Image
        src={brand.assets.subjectMath}
        alt=""
        width={160}
        height={160}
        className="h-20 w-20 object-contain md:h-24 md:w-24"
        aria-hidden
      />
    );
  }

  if (subject.slug === "reading") {
    return (
      <Image
        src={brand.assets.subjectReading}
        alt=""
        width={160}
        height={160}
        className="h-20 w-20 object-contain md:h-24 md:w-24"
        aria-hidden
      />
    );
  }

  return (
    <PathIllustration
      variant={subject.slug === "reading" ? "book" : "spark"}
    />
  );
}

function pathActionLabel(path: PathCatalog, premiumAccess: boolean) {
  if (path.progress >= 1) return "Repasar";
  if (path.progress > 0) return "Continuar";
  return path.isPremium && !premiumAccess ? "Probar gratis" : "Empezar";
}

function pathProgressText(path: PathCatalog) {
  if (path.lessonsTotal === 0) return "Sin lecciones";
  return `${path.lessonsDone}/${path.lessonsTotal} lecciones`;
}

function RecommendedPathCard({
  entry,
  premiumAccess,
}: {
  entry: PathEntry;
  premiumAccess: boolean;
}) {
  const progressPct = Math.round(entry.path.progress * 100);
  const actionLabel = pathActionLabel(entry.path, premiumAccess);

  return (
    <Link
      href={`/paths/${entry.path.slug}`}
      className="group mb-10 block rounded-[30px] border-2 border-[#dce4ff] bg-[#f7f9ff] p-4 shadow-[0_5px_0_#dce4ff] transition-transform active:scale-[0.99] md:mb-14 md:p-6 md:hover:-translate-y-1"
      aria-label={`${actionLabel} ${entry.path.name}`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-7">
        <div className="grid h-28 w-full place-items-center rounded-[26px] bg-white shadow-inner md:h-36 md:w-40 md:shrink-0">
          <CatalogIcon entry={entry} className="h-28 w-28" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#dfe6ff] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#4867f5]">
            <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
            Recomendado
          </div>
          <h2 className="mt-3 font-fredoka text-2xl font-bold leading-tight text-slate-950 md:text-3xl">
            {entry.path.name}
          </h2>
          {entry.path.description && (
            <p className="mt-2 line-clamp-2 max-w-xl text-sm font-semibold leading-6 text-slate-500 md:text-base">
              {entry.path.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-wide text-slate-400">
            <span>{entry.subject.name}</span>
            <span>{pathProgressText(entry.path)}</span>
            {entry.path.isPremium && (
              <span className="rounded-full bg-[#ffc94a] px-2 py-0.5 text-slate-950">
                {premiumAccess ? "Premium" : "Premium · 1 gratis"}
              </span>
            )}
          </div>

          <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: entry.accent }}
            />
          </div>
        </div>

        <span className="btn-chunky inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4867f5] px-5 py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_5px_0_#2445d8] md:min-w-40">
          {actionLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function PathCourseCard({
  entry,
  isNew,
  premiumAccess,
}: {
  entry: PathEntry;
  isNew: boolean;
  premiumAccess: boolean;
}) {
  const progressPct = Math.round(entry.path.progress * 100);
  const actionLabel = pathActionLabel(entry.path, premiumAccess);

  return (
    <Link
      href={`/paths/${entry.path.slug}`}
      className="group block rounded-[26px] border-2 border-slate-200 bg-white p-4 shadow-[0_5px_0_#e5e7eb] transition-transform active:scale-[0.98] md:w-60 md:shrink-0 md:hover:-translate-y-1"
      aria-label={`${actionLabel} ${entry.path.name}`}
    >
      <div className="flex items-center gap-4 md:block">
        <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-[22px] bg-slate-50 md:h-36 md:w-full">
          {isNew && (
            <span className="absolute right-2 top-2 rounded-full bg-[#16b84e] px-2.5 py-1 text-[10px] font-black uppercase text-white">
              Nuevo
            </span>
          )}
          {entry.path.isPremium && (
            <span className="absolute left-2 top-2 rounded-full bg-[#ffc94a] px-2.5 py-1 text-[10px] font-black uppercase text-slate-950">
              {premiumAccess ? "Premium" : "1 gratis"}
            </span>
          )}
          <CatalogIcon entry={entry} />
        </div>

        <div className="min-w-0 flex-1 md:mt-4">
          <div className="font-fredoka text-lg font-bold leading-tight text-slate-950">
            {entry.path.name}
          </div>
          <div className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">
            {pathProgressText(entry.path)}
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full"
              style={{ width: `${progressPct}%`, backgroundColor: entry.accent }}
            />
          </div>

          <span className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#4867f5] px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-[0_4px_0_#2445d8]">
            {actionLabel}
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function SubjectsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  const premiumAccess = hasPremiumAccess(user);

  const subjects = await getSubjectsPathCatalog(child.id);
  const visibleSubjects = subjects.filter(
    (subject) => subject.learningPaths.length > 0 || subject.isActive,
  );
  const pathEntries = visibleSubjects.flatMap((subject) => {
    const accent = accentByColor[subject.color] ?? "#4867f5";
    return subject.learningPaths.map((path, index) => ({
      subject,
      path,
      accent,
      illustration: pathIllustrations[index % pathIllustrations.length],
    }));
  });
  const recommendedPath =
    pathEntries.find(({ path }) => path.progress > 0 && path.progress < 1) ??
    pathEntries.find(({ path }) => path.progress === 0) ??
    pathEntries[0] ??
    null;

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
              Avanza paso a paso con juegos visuales.
            </p>
          </header>

          {recommendedPath && (
            <RecommendedPathCard
              entry={recommendedPath}
              premiumAccess={premiumAccess}
            />
          )}

          <div className="space-y-12">
            {visibleSubjects.map((subject) => {
              const enabled =
                subject.isActive && subject.learningPaths.length > 0;
              const accent = accentByColor[subject.color] ?? "#4867f5";

              return (
                <section key={subject.id} aria-labelledby={`${subject.slug}-title`}>
                  <div className="mb-8 flex items-center gap-6">
                    <div className="relative h-20 w-20 shrink-0 md:h-24 md:w-24">
                      <SubjectIcon subject={subject} />
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
                    <div className="rounded-[28px] bg-slate-50 p-4 md:overflow-x-auto md:px-8 md:py-10">
                      <div className="grid gap-4 md:flex md:min-w-max md:gap-5">
                        {subject.learningPaths.map((path, index) => {
                          const isNew = index === 0 && path.progress === 0;
                          const entry = {
                            subject,
                            path,
                            accent,
                            illustration:
                              pathIllustrations[index % pathIllustrations.length],
                          };

                          return (
                            <PathCourseCard
                              key={path.id}
                              entry={entry}
                              isNew={isNew}
                              premiumAccess={premiumAccess}
                            />
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
