// app/achievements/page.tsx — datos reales
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveChild, getAchievementsWithProgress } from "@/lib/queries";
import { BottomNav } from "@/components/BottomNav";

export default async function AchievementsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const medals = await getAchievementsWithProgress(child.id);
  const got = medals.filter((m) => m.unlocked).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-sun-soft to-cream md:bg-cream">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <div>
            <div className="text-[10px] font-black text-sun-deep tracking-widest">🏆 MEDALLAS</div>
            <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink leading-none">{got} / {medals.length}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-28 md:pb-12 grid grid-cols-2 md:grid-cols-3 gap-3">
          {medals.map((m) => (
            <div key={m.id} className={`rounded-2xl p-4 text-center ${m.unlocked ? "bg-white" : "bg-white/50"}`} style={{ boxShadow: "var(--shadow-chunky-sm)", filter: m.unlocked ? "none" : "grayscale(.6)", opacity: m.unlocked ? 1 : 0.7 }}>
              <div className="text-5xl">{m.unlocked ? m.icon : "🔒"}</div>
              <div className="font-fredoka font-bold text-ink mt-1">{m.name}</div>
              <div className="text-[10px] font-bold text-ink-soft px-1">{m.description}</div>
              <div className="mt-2 h-1.5 bg-cream rounded-full overflow-hidden">
                <div className="h-full bg-sun rounded-full" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}/>
              </div>
              <div className="text-[10px] font-bold text-ink-mute mt-1">{m.current}/{m.target}</div>
            </div>
          ))}
        </div>
      </main>

      <div className="md:hidden"><BottomNav/></div>
    </div>
  );
}
