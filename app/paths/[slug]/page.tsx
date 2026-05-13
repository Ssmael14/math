import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getActiveChild,
  getEnrollments,
  getLearningPathBySlug,
  getUnitsWithProgress,
} from "@/lib/queries";
import { TopNav } from "@/components/TopNav";
import { EnrollPathButton } from "./EnrollPathButton";

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
              href={`/subjects/${path.subject.slug}`}
              className="hover:text-ink"
            >
              {path.subject.name.toUpperCase()}
            </Link>
            <span aria-hidden>·</span>
            <span>{path.name.toUpperCase()}</span>
          </nav>

          <div className="mb-4 md:mb-6 flex items-start gap-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl border-2 border-white shrink-0 bg-linear-to-br ${bgByColor[path.subject.color] ?? bgByColor.peach}`}
              style={{ boxShadow: "var(--shadow-chunky)" }}
            >
              {path.subject.icon}
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
                {path.subject.name.toUpperCase()}
              </div>
              <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">
                {path.name}
              </h1>
              {path.description && (
                <p className="text-sm md:text-base font-bold text-ink/70 mt-1 max-w-2xl">
                  {path.description}
                </p>
              )}
              <div className="mt-3">
                <EnrollPathButton
                  childId={child.id}
                  learningPathSlug={path.slug}
                  enrolled={enrolled}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {units.map((u, i) => {
              const done = u.progress >= 1;
              const bg = bgByColor[u.color ?? ""] ?? "from-peach-soft to-peach";
              return (
                <Link
                  key={u.id}
                  href={`/units/${u.slug}`}
                  className={`btn-chunky flex md:flex-col md:items-start items-center gap-3 md:gap-4 p-4 md:p-6 rounded-3xl border-4 border-white bg-linear-to-br ${bg}`}
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl border-2 border-white shrink-0 bg-white/85">
                    {u.icon ?? "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-extrabold tracking-wider text-ink/70">
                      UNIDAD {i + 1}
                    </div>
                    <div className="font-fredoka font-bold text-lg md:text-xl text-ink">
                      {u.title}
                    </div>
                    <div className="text-xs font-bold mt-1 text-ink/70">
                      {u.lessonsDone}/{u.lessonsTotal} lecciones
                    </div>
                    {u.progress > 0 && u.progress < 1 && (
                      <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white"
                          style={{ width: `${u.progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="md:self-end">
                    {done ? (
                      <div
                        className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-white font-bold"
                        style={{ boxShadow: "0 2px 0 #4DA86A" }}
                      >
                        ✓
                      </div>
                    ) : (
                      <div className="text-[10px] font-black bg-ink text-white px-3 py-1.5 rounded-lg">
                        JUGAR
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
