import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getActiveChild, getSubjectBySlug } from "@/lib/queries";
import { brand } from "@/lib/brand";
import { TopNav } from "@/components/TopNav";

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
  const subject = await getSubjectBySlug(slug);

  if (!subject) {
    return { title: `Materia no encontrada · ${brand.appName}` };
  }

  return {
    title: `${subject.name} · ${brand.appName}`,
    description:
      subject.description ??
      `Explora ${subject.name} y sus caminos de aprendizaje.`,
  };
}

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { slug } = await params;
  const subject = await getSubjectBySlug(slug);
  if (!subject) notFound();

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
            <span>{subject.name.toUpperCase()}</span>
          </nav>

          <div className="mb-4 md:mb-6 flex items-start gap-4">
            <div
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl border-2 border-white shrink-0 bg-linear-to-br ${bgByColor[subject.color] ?? bgByColor.peach}`}
              style={{ boxShadow: "var(--shadow-chunky)" }}
            >
              {subject.icon}
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
                {subject.isActive ? "CAMINO EDUCATIVO" : "PRONTO"}
              </div>
              <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">
                {subject.name}
              </h1>
              {subject.description && (
                <p className="text-sm md:text-base font-bold text-ink/70 mt-1 max-w-2xl">
                  {subject.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {subject.learningPaths.map((path) => {
              const bg = bgByColor[subject.color] ?? "from-peach-soft to-peach";
              return (
                <Link
                  key={path.id}
                  href={`/paths/${path.slug}`}
                  className={`btn-chunky flex flex-col items-start gap-3 p-5 md:p-6 rounded-3xl border-4 border-white bg-gradient-to-br ${bg}`}
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >
                  <div className="text-[10px] font-extrabold tracking-wider text-ink/70">
                    {path.level} {path.grade ? `· ${path.grade}°` : ""}
                  </div>
                  <div className="font-fredoka font-bold text-lg md:text-xl text-ink">
                    {path.name}
                  </div>
                  {path.description && (
                    <div className="text-xs md:text-sm font-bold text-ink/70">
                      {path.description}
                    </div>
                  )}
                  <div className="mt-1 text-[10px] font-black bg-ink text-white px-3 py-1 rounded-lg">
                    VER UNIDADES
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
