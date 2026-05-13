// app/subjects/page.tsx
// Pantalla de selección de materia. Hub del producto multi-materia.
// Las inactivas (Reading/Science/English) muestran "Coming soon" en gris.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveChild, getSubjects } from "@/lib/queries";
import { TopNav } from "@/components/TopNav";

const bgByColor: Record<string, string> = {
  peach: "from-peach-soft to-peach",
  mint: "from-mint-soft to-mint",
  sky: "from-sky-soft to-sky",
  sun: "from-sun-soft to-sun",
  lilac: "from-lilac-soft to-lilac",
  pink: "from-peach to-pink",
};

export default async function SubjectsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const subjects = await getSubjects();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream md:bg-white">
      <TopNav />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-4 md:mb-6">
            <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
              ¿QUÉ QUERÉS APRENDER?
            </div>
            <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">
              Materias
            </h1>
          </div>

          <div className="grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-2">
            {subjects.map((s) => {
              const bg = bgByColor[s.color] ?? "from-peach-soft to-peach";
              const enabled = s.isActive && s._count.learningPaths > 0;
              const href = enabled ? `/subjects/${s.slug}` : "#";
              return (
                <Link
                  key={s.id}
                  href={href}
                  aria-disabled={!enabled}
                  className={`btn-chunky flex items-center gap-4 p-5 md:p-6 rounded-3xl border-4 border-white bg-gradient-to-br ${
                    enabled
                      ? bg
                      : "from-[#F0EBF5] to-[#F0EBF5] opacity-70 pointer-events-none"
                  }`}
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl md:text-5xl border-2 border-white flex-shrink-0 ${
                      enabled ? "bg-white/85" : "bg-white/60"
                    }`}
                  >
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-fredoka font-bold text-xl md:text-2xl text-ink">
                      {s.name}
                    </div>
                    {s.description && (
                      <div className="text-xs md:text-sm font-bold text-ink/70 mt-1">
                        {s.description}
                      </div>
                    )}
                    <div className="mt-2">
                      {enabled ? (
                        <span className="text-[10px] font-black bg-ink text-white px-3 py-1 rounded-lg">
                          ENTRAR
                        </span>
                      ) : (
                        <span className="text-[10px] font-black bg-ink-mute/30 text-ink-mute px-3 py-1 rounded-lg">
                          PRONTO ✨
                        </span>
                      )}
                    </div>
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
