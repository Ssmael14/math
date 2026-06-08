// app/achievements/page.tsx — datos reales
import { redirect } from "next/navigation";
import { getActiveChild, getAchievementsWithProgress } from "@/lib/queries";
import { TopNav } from "@/components/TopNav";

export default async function AchievementsPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const medals = await getAchievementsWithProgress(child.id);
  const got = medals.filter((m) => m.unlocked).length;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-sky-soft via-white to-cream md:bg-cream">
      <TopNav/>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-4 md:mb-6">
            <div className="text-[10px] font-black text-sky tracking-widest">🏆 MEDALLAS</div>
            <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">{got} / {medals.length}</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {medals.map((m) => (
            <div key={m.id} className={`rounded-2xl border p-4 text-center ${m.unlocked ? "border-sky-soft bg-white" : "border-slate-200 bg-white/60"}`} style={{ boxShadow: "var(--shadow-chunky-sm)", filter: m.unlocked ? "none" : "grayscale(.6)", opacity: m.unlocked ? 1 : 0.7 }}>
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-4xl ${m.unlocked ? "bg-sun-soft" : "bg-slate-100"}`}>{m.unlocked ? m.icon : "🔒"}</div>
              <div className="font-fredoka font-bold text-ink mt-1">{m.name}</div>
              <div className="text-[10px] font-bold text-ink-soft px-1">{m.description}</div>
              <div className="mt-2 h-1.5 bg-sky-soft rounded-full overflow-hidden">
                <div className="h-full bg-sky rounded-full" style={{ width: `${Math.min(100, (m.current / m.target) * 100)}%` }}/>
              </div>
              <div className="text-[10px] font-bold text-ink-mute mt-1">{m.current}/{m.target}</div>
            </div>
          ))}
          </div>
        </div>
      </main>
    </div>
  );
}
