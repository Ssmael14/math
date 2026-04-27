// app/league/page.tsx — leaderboard real desde WeeklyXP
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveChild, getLeaderboard } from "@/lib/queries";
import { BottomNav } from "@/components/BottomNav";

export default async function LeaguePage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const { rows, myRank, league } = await getLeaderboard(child.id);
  const isEmpty = rows.length === 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-mint-soft to-cream md:bg-cream">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-3xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <div>
            <div className="text-[10px] font-black text-mint tracking-widest">🏅 LIGA SEMANAL</div>
            <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink leading-none">Liga {league}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-28 md:pb-12">
          <div className="bg-white rounded-2xl p-4 mb-4 text-center" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <div className="text-xs font-bold text-ink-soft">Tu posición</div>
            <div className="font-fredoka text-4xl font-bold text-ink mt-1">{myRank ? `#${myRank}` : "—"}</div>
            <div className="text-xs font-bold text-mint">Top 3 sube de liga 🚀</div>
          </div>

          {isEmpty ? (
            <div className="text-center py-12 text-ink-soft">
              <div className="text-5xl mb-3">🏁</div>
              <div className="font-bold">¡La liga arranca cuando completés tu primera lección!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((u) => {
                const top3 = u.rank <= 3;
                return (
                  <div key={u.rank} className={`flex items-center gap-3 rounded-2xl p-3 ${u.isMe ? "bg-mint-soft border-2 border-mint" : "bg-white"}`} style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-fredoka font-bold ${top3 ? "bg-sun text-ink" : "bg-cream text-ink-soft"}`}>{u.rank}</div>
                    <div className="text-2xl">{u.avatar}</div>
                    <div className="flex-1 font-fredoka font-bold text-ink">{u.name}{u.isMe && " (vos)"}</div>
                    <div className="font-bold text-ink-soft text-sm">⭐ {u.xp}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <div className="md:hidden"><BottomNav/></div>
    </div>
  );
}
