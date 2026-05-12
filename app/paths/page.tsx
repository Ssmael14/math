// app/paths/page.tsx
// Lista de LearningPaths para un subject. Cada path representa un nivel
// (Primary 1, Secondary Algebra, etc.). Click → enroll + ir a /home.
import { notFound, redirect } from "next/navigation";
import { getActiveChild, getLearningPathsBySubject, getEnrollments } from "@/lib/queries";
import { TopNav } from "@/components/TopNav";
import { PathsClient } from "./PathsClient";

const LEVEL_LABEL: Record<string, string> = {
  INITIAL: "Inicial",
  PRIMARY: "Primaria",
  SECONDARY: "Secundaria",
  PREUNIVERSITY: "Pre-universitario",
};

export default async function PathsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { subject } = await searchParams;
  if (!subject) redirect("/subjects");

  const subjectWithPaths = await getLearningPathsBySubject(subject);
  if (!subjectWithPaths) notFound();
  if (!subjectWithPaths.isActive) {
    // Materia inactiva: el user manipuló la URL. Mandalo de vuelta.
    redirect("/subjects");
  }

  const enrollments = await getEnrollments(child.id);
  const enrolledPathIds = new Set(enrollments.map((e) => e.learningPathId));

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream md:bg-white">
      <TopNav/>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-4 md:mb-6">
            <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
              {subjectWithPaths.name.toUpperCase()} {subjectWithPaths.icon}
            </div>
            <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">
              Elegí tu nivel
            </h1>
          </div>

          <PathsClient
            childId={child.id}
            paths={subjectWithPaths.learningPaths.map((p) => ({
              id: p.id,
              slug: p.slug,
              name: p.name,
              description: p.description ?? null,
              level: LEVEL_LABEL[p.level] ?? p.level,
              grade: p.grade ?? null,
              isPremium: p.isPremium,
              enrolled: enrolledPathIds.has(p.id),
            }))}
          />
        </div>
      </main>
    </div>
  );
}
