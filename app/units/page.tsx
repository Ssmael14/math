// app/units/page.tsx — layout responsive (mobile lista, desktop grid)
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveChild, getUnitsWithProgress } from "@/lib/queries";
import { BottomNav } from "@/components/BottomNav";

const bgByColor: Record<string, string> = {
  peach: "from-peach-soft to-peach",
  mint: "from-mint-soft to-mint",
  sky: "from-sky-soft to-sky",
  sun: "from-sun-soft to-sun",
  lilac: "from-lilac-soft to-lilac",
  pink: "from-peach to-pink",
};

export default async function UnitsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const units = await getUnitsWithProgress(child.id);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream md:bg-white">
      {/* TOP BAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-4">
          <Link href="/home" className="w-9 h-9 flex items-center justify-center text-xl text-ink-soft hover:text-ink">←</Link>
          <div>
            <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">APRENDER MATEMÁTICAS</div>
            <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink leading-none">Unidades</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-28 md:pb-12 grid gap-3 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {units.map((u, i) => {
            const locked = u.isPremium && u.progress === 0;
            const done = u.progress >= 1;
            const current = !done && !locked;
            const bg = bgByColor[u.color] ?? "from-peach-soft to-peach";
            return (
              <Link
                key={u.id}
                href={current ? "/home" : "#"}
                className={`btn-chunky flex md:flex-col md:items-start items-center gap-3 md:gap-4 p-4 md:p-6 rounded-3xl border-4 border-white bg-gradient-to-br ${locked ? "from-[#F0EBF5] to-[#F0EBF5] opacity-70" : bg}`}
                style={{ boxShadow: "var(--shadow-chunky)" }}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-3xl md:text-4xl border-2 border-white flex-shrink-0 ${locked ? "bg-white/60" : "bg-white/85"}`}>
                  {locked ? "🔒" : u.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-extrabold tracking-wider ${locked ? "text-ink-mute" : "text-ink/70"}`}>UNIDAD {i + 1}</div>
                  <div className={`font-fredoka font-bold text-lg md:text-xl ${locked ? "text-ink-soft" : "text-ink"}`}>{u.title}</div>
                  <div className={`text-xs font-bold mt-1 ${locked ? "text-ink-mute" : "text-ink/70"}`}>
                    {u.lessonsDone}/{u.lessonsTotal} lecciones
                  </div>
                  {u.progress > 0 && u.progress < 1 && (
                    <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${u.progress * 100}%` }}/>
                    </div>
                  )}
                </div>
                <div className="md:self-end">
                  {done && <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-white font-bold" style={{ boxShadow: "0 2px 0 #4DA86A" }}>✓</div>}
                  {current && <div className="text-[10px] font-black bg-ink text-white px-3 py-1.5 rounded-lg">JUGAR</div>}
                  {locked && <div className="text-[10px] font-black bg-sun text-ink px-3 py-1.5 rounded-lg">PREMIUM ✨</div>}
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <div className="md:hidden"><BottomNav/></div>
    </div>
  );
}
