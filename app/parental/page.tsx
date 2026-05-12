// app/parental/page.tsx — Server Component con analytics reales, responsive
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getActiveChild, getMasteryStats } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/server";
import { PARENT_SESSION_COOKIE } from "./session";
import {
  findWeakSpots,
  activeDays,
  avgExerciseTimeMs,
} from "@/lib/analytics/parent-insights";

function startOfDay(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0); return x;
}

export default async function ParentalPage() {
  const user = await requireUser();
  const c = await cookies();
  // Gate: si tiene PIN seteado y la cookie no está → mandar a gate
  if (user.parentalPin && c.get(PARENT_SESSION_COOKIE)?.value !== "1") {
    redirect("/parental/gate");
  }
  // Si no tiene PIN aún, también pasar por gate para crearlo (recomendado)
  if (!user.parentalPin) redirect("/parental/gate");

  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const now = new Date();
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 864e5));
  const monthStart = startOfDay(new Date(now.getTime() - 29 * 864e5));

  // Una sola query trae intentos de los últimos 30 días — la semana se filtra
  // en memoria. Así evitamos N+1 sin sacrificar el chart semanal.
  const [attemptsMonth, exercises, masteryStats] = await Promise.all([
    prisma.attempt.findMany({
      where: { childId: child.id, createdAt: { gte: monthStart } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.exercise.findMany({
      select: { id: true, prompt: true, kind: true },
    }),
    getMasteryStats(child.id),
  ]);

  const attempts = attemptsMonth.filter((a) => a.createdAt >= weekStart);
  const weakSpots = findWeakSpots(attemptsMonth, exercises, { minAttempts: 3, minErrorRate: 0.3, limit: 5 });
  const daysActive30 = activeDays(attemptsMonth, 30, now);
  const avgMs = avgExerciseTimeMs(attemptsMonth);

  const days: { label: string; minutes: number; attempts: number; correct: number }[] = [];
  const dayLabels = ["D", "L", "M", "M", "J", "V", "S"];
  for (let i = 6; i >= 0; i--) {
    const d = startOfDay(new Date(now.getTime() - i * 864e5));
    const nextD = new Date(d.getTime() + 864e5);
    const dayAttempts = attempts.filter((a) => a.createdAt >= d && a.createdAt < nextD);
    const totalMs = dayAttempts.reduce((s, a) => s + a.timeMs, 0);
    days.push({
      label: dayLabels[d.getDay()],
      minutes: Math.round(totalMs / 60000),
      attempts: dayAttempts.length,
      correct: dayAttempts.filter((a) => a.correct).length,
    });
  }

  const today = days[6];
  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const lessonsCompleted = await prisma.progress.count({ where: { childId: child.id, completed: true } });
  const maxMin = Math.max(...days.map((d) => d.minutes), 1);

  return (
    <div className="min-h-[100dvh] bg-[#F5F0FB] md:bg-cream flex flex-col">
      {/* TOP BAR */}
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <div>
            <div className="text-[10px] font-black text-lilac tracking-widest">👨‍👩‍👧 MODO PADRES</div>
            <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink leading-none">Progreso de {child.name}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8 space-y-4 md:space-y-6">
          {/* Stats hoy */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              { icon: "⏱️", value: today.minutes, label: "Minutos hoy", bg: "bg-peach-soft" },
              { icon: "📚", value: lessonsCompleted, label: "Lecciones", bg: "bg-sky-soft" },
              { icon: "🎯", value: `${accuracy}%`, label: "Aciertos", bg: "bg-mint-soft" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 md:p-5 text-center`}>
                <div className="text-2xl md:text-3xl">{s.icon}</div>
                <div className="font-fredoka text-2xl md:text-3xl font-bold text-ink">{s.value}</div>
                <div className="text-[10px] md:text-xs font-bold text-ink-soft">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
            {/* Chart semana */}
            <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-black text-ink-soft tracking-wider">ESTA SEMANA</div>
                <div className="text-[10px] font-bold text-ink-mute">{totalAttempts} intentos</div>
              </div>
              <div className="flex items-end justify-between h-32 md:h-40 gap-1">
                {days.map((d, i) => {
                  const h = Math.max((d.minutes / maxMin) * 100, d.attempts > 0 ? 8 : 3);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-md bg-gradient-to-t from-pink to-sun transition-all" style={{ height: `${h}%`, minHeight: 3 }}/>
                      <div className="text-[9px] md:text-xs font-bold text-ink-soft">{d.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estado actual */}
            <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
              <div className="text-xs font-black text-ink-soft tracking-wider mb-3">ESTADO ACTUAL</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div><div className="text-xl md:text-2xl">🔥</div><div className="font-fredoka font-bold text-ink">{child.streak}</div><div className="text-[9px] font-bold text-ink-mute">RACHA</div></div>
                <div><div className="text-xl md:text-2xl">⭐</div><div className="font-fredoka font-bold text-ink">{child.xp}</div><div className="text-[9px] font-bold text-ink-mute">XP</div></div>
                <div><div className="text-xl md:text-2xl">💎</div><div className="font-fredoka font-bold text-ink">{child.gems}</div><div className="text-[9px] font-bold text-ink-mute">GEMAS</div></div>
                <div><div className="text-xl md:text-2xl">🏆</div><div className="font-fredoka font-bold text-ink">N{child.level}</div><div className="text-[9px] font-bold text-ink-mute">NIVEL</div></div>
              </div>
            </div>
          </div>

          {/* SRS · estado de aprendizaje */}
          <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-black text-ink-soft tracking-wider">APRENDIZAJE</div>
              <div className="text-[10px] font-bold text-ink-mute">SM-2 · spaced repetition</div>
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
              <div className="bg-mint-soft border-2 border-mint rounded-2xl p-3">
                <div className="text-2xl">🏅</div>
                <div className="font-fredoka text-2xl font-bold text-ink">{masteryStats.mastered}</div>
                <div className="text-[10px] font-bold text-ink-soft uppercase">Dominados</div>
              </div>
              <div className="bg-sun-soft border-2 border-sun rounded-2xl p-3">
                <div className="text-2xl">📖</div>
                <div className="font-fredoka text-2xl font-bold text-ink">{masteryStats.learning}</div>
                <div className="text-[10px] font-bold text-ink-soft uppercase">Aprendiendo</div>
              </div>
              <div className="bg-peach-soft border-2 border-pink rounded-2xl p-3">
                <div className="text-2xl">🔁</div>
                <div className="font-fredoka text-2xl font-bold text-ink">{masteryStats.dueToday}</div>
                <div className="text-[10px] font-bold text-ink-soft uppercase">Para repasar</div>
              </div>
            </div>
          </div>

          {/* Conceptos difíciles */}
          <div className="bg-white rounded-2xl p-4 md:p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-black text-ink-soft tracking-wider">PUNTOS DÉBILES</div>
              <div className="text-[10px] font-bold text-ink-mute">últimos 30 días</div>
            </div>
            {weakSpots.length === 0 ? (
              <div className="text-sm text-ink-soft py-4 text-center">
                ¡No hay puntos débiles claros todavía!{" "}
                <span className="text-ink-mute">Necesitamos más práctica para detectarlos.</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {weakSpots.map((w) => (
                  <li
                    key={w.exerciseId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-cream border border-ink/5"
                  >
                    <div className="w-10 h-10 rounded-lg bg-peach-soft flex items-center justify-center text-lg flex-shrink-0">
                      {kindIcon(w.kind)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-ink truncate">{w.prompt}</div>
                      <div className="text-[11px] font-bold text-ink-soft">
                        {w.wrongs} de {w.attempts} fallos · {Math.round(w.avgTimeMs / 1000)}s prom.
                      </div>
                    </div>
                    <div className="text-pink font-fredoka font-bold text-lg flex-shrink-0">
                      {Math.round(w.errorRate * 100)}%
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Uso 30 días */}
          <div className="bg-white rounded-2xl p-4 md:p-6 grid grid-cols-2 gap-4 md:gap-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <div>
              <div className="text-xs font-black text-ink-soft tracking-wider mb-1">DÍAS ACTIVOS</div>
              <div className="font-fredoka text-3xl md:text-4xl font-bold text-ink">{daysActive30}<span className="text-ink-mute text-xl">/30</span></div>
              <div className="text-[11px] font-bold text-ink-soft mt-0.5">
                {Math.round((daysActive30 / 30) * 100)}% de los días
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-ink-soft tracking-wider mb-1">TIEMPO PROM.</div>
              <div className="font-fredoka text-3xl md:text-4xl font-bold text-ink">
                {avgMs > 0 ? `${(avgMs / 1000).toFixed(1)}s` : "—"}
              </div>
              <div className="text-[11px] font-bold text-ink-soft mt-0.5">por ejercicio</div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-3">
            <Link href="/settings" className="btn-chunky flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>⚙️ Ajustes de la app</span><span className="text-ink-mute">›</span>
            </Link>
            <Link href="/shop" className="btn-chunky flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <span>✨ Ir a Premium</span><span className="text-ink-mute">›</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function kindIcon(kind: string): string {
  switch (kind) {
    case "COUNT": return "🔢";
    case "DRAG": return "🐟";
    case "SUBTRACT": return "🧁";
    case "FILL": return "🧩";
    case "MATCH": return "🔗";
    case "TRACE": return "✍️";
    case "ORDER": return "🪜";
    case "SPEED": return "⚡";
    default: return "🎯";
  }
}
