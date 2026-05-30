import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getActiveChild,
  getLessonsWithState,
  getUnitBySlug,
} from "@/lib/queries";
import { TopNav } from "@/components/TopNav";

export const dynamic = "force-dynamic";

const bgByColor: Record<string, string> = {
  peach: "from-peach-soft to-peach",
  mint: "from-mint-soft to-mint",
  sky: "from-sky-soft to-sky",
  sun: "from-sun-soft to-sun",
  lilac: "from-lilac-soft to-lilac",
  pink: "from-peach to-pink",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const unit = await getUnitBySlug(slug);

  if (!unit) {
    return { title: "Unidad no encontrada · LearnMath" };
  }

  return {
    title: `${unit.title} · ${unit.learningPath.subject.name} · LearnMath`,
    description:
      unit.description ??
      `Explorá ${unit.title} dentro de ${unit.learningPath.name}.`,
  };
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { slug } = await params;
  const unit = await getUnitBySlug(slug);
  if (!unit) notFound();

  const unitWithState = await getLessonsWithState(
    unit.learningPathId,
    unit.slug,
    child.id,
  );
  if (!unitWithState) notFound();

  const { lessons } = unitWithState;
  const currentLesson =
    lessons.find((lesson) => lesson.status === "current") ?? lessons[0] ?? null;
  const doneCount = lessons.filter((lesson) => lesson.status === "done").length;
  const progress = lessons.length ? doneCount / lessons.length : 0;

  return (
    <div className="min-h-dvh flex flex-col bg-cream md:bg-white">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 text-[11px] font-extrabold tracking-widest text-ink-mute flex flex-wrap items-center gap-2"
          >
            <Link href="/subjects" className="hover:text-ink">
              MATERIAS
            </Link>
            <span aria-hidden>·</span>
            <Link
              href={`/subjects/${unit.learningPath.subject.slug}`}
              className="hover:text-ink"
            >
              {unit.learningPath.subject.name.toUpperCase()}
            </Link>
            <span aria-hidden>·</span>
            <Link
              href={`/paths/${unit.learningPath.slug}`}
              className="hover:text-ink"
            >
              {unit.learningPath.name.toUpperCase()}
            </Link>
            <span aria-hidden>·</span>
            <span>{unit.title.toUpperCase()}</span>
          </nav>

          <div className="mb-4 md:mb-6 flex items-start gap-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl border-2 border-white shrink-0 bg-linear-to-br ${bgByColor[unit.color ?? ""] ?? bgByColor.peach}`}
              style={{ boxShadow: "var(--shadow-chunky)" }}
            >
              {unit.icon ?? "📚"}
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
                {unit.learningPath.subject.name.toUpperCase()} ·{" "}
                {unit.learningPath.name.toUpperCase()}
              </div>
              <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">
                {unit.title}
              </h1>
              {unit.description && (
                <p className="text-sm md:text-base font-bold text-ink/70 mt-1 max-w-2xl">
                  {unit.description}
                </p>
              )}
            </div>
          </div>

          <div
            className="mb-5 rounded-3xl bg-white border-4 border-white p-4 md:p-5"
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-extrabold tracking-widest text-ink-mute">
                  AVANCE DE LA UNIDAD
                </div>
                <div className="font-fredoka text-lg font-bold text-ink">
                  {doneCount}/{lessons.length} lecciones completas
                </div>
              </div>
              <div className="text-sm font-black text-ink">
                {Math.round(progress * 100)}%
              </div>
            </div>
            <div className="mt-3 h-2 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-mint rounded-full transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson, index) => {
              const href =
                lesson.status === "locked" ? "#" : `/lesson/${lesson.id}`;
              const isLocked = lesson.status === "locked";
              const isDone = lesson.status === "done";
              const isAvailable = lesson.status === "available";
              return (
                <Link
                  key={lesson.id}
                  href={href}
                  aria-disabled={isLocked}
                  className={`btn-chunky flex items-center gap-4 p-4 md:p-5 rounded-3xl border-4 border-white bg-white ${
                    isLocked ? "pointer-events-none opacity-80" : "hover:border-sky"
                  }`}
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-sun-soft flex items-center justify-center text-2xl font-black text-ink shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-extrabold tracking-wider text-ink/70">
                      {lesson.status === "done"
                        ? "HECHA"
                        : lesson.status === "current"
                          ? "LISTA PARA JUGAR"
                          : isAvailable
                            ? "DISPONIBLE"
                            : "BLOQUEADA"}
                    </div>
                    <div className="font-fredoka font-bold text-lg text-ink">
                      {lesson.title}
                    </div>
                  </div>
                  <div className="md:self-end">
                    {lesson.status === "done" ? (
                      <div
                        className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-white font-bold"
                        style={{ boxShadow: "0 2px 0 #4DA86A" }}
                      >
                        ✓
                      </div>
                    ) : lesson.status === "current" ? (
                      <div className="text-[10px] font-black bg-ink text-white px-3 py-1.5 rounded-lg">
                        JUGAR
                      </div>
                    ) : isAvailable ? (
                      <div className="text-[10px] font-black bg-sky text-white px-3 py-1.5 rounded-lg">
                        ABRIR
                      </div>
                    ) : (
                      <div className="text-[10px] font-black bg-ink-mute text-white px-3 py-1.5 rounded-lg">
                        🔒
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {!currentLesson && (
            <div
              className="mt-6 rounded-3xl bg-white p-5 text-center text-ink-soft font-bold"
              style={{ boxShadow: "var(--shadow-chunky)" }}
            >
              Esta unidad todavía no tiene lecciones disponibles.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
