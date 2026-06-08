// app/profile/page.tsx — perfil con selector multi-niño
import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveChild, getMasteryStats } from "@/lib/queries";
import { requireUser } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { hasPremiumAccess, premiumStatus } from "@/lib/premium";
import { ageFromBirthDate } from "@/lib/age";
import { brand } from "@/lib/brand";
import { TopNav } from "@/components/TopNav";
import { ChildSwitcher } from "./ChildSwitcher";

export default async function ProfilePage() {
  const user = await requireUser();
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const [lessonsCompleted, totalAttempts, correctAttempts, masteryStats] = await Promise.all([
    prisma.progress.count({ where: { childId: child.id, completed: true } }),
    prisma.attempt.count({ where: { childId: child.id } }),
    prisma.attempt.count({ where: { childId: child.id, correct: true } }),
    getMasteryStats(child.id),
  ]);
  const accuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
  const isPremium = hasPremiumAccess(user);
  const premiumState = premiumStatus(user);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-sky-soft via-white to-cream md:bg-cream md:bg-none">
      <TopNav/>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-10 flex items-center justify-between">
          <div className="text-[10px] md:text-xs font-black text-sky tracking-widest">MI PERFIL</div>
          <div className="flex items-center gap-2">
            <Link href="/parental" className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }} aria-label="Modo padres">👨‍👩‍👧</Link>
            <Link href="/settings" className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }} aria-label="Ajustes">⚙️</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-12 md:grid md:grid-cols-[320px_1fr] md:gap-12">
          <aside className="text-center md:text-left">
            <div className="inline-flex w-28 h-28 md:w-32 md:h-32 rounded-full bg-white items-center justify-center text-6xl md:text-7xl border-4 border-white" style={{ boxShadow: "var(--shadow-chunky)" }}>
              {child.avatar}
            </div>
            <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mt-3">{child.name}</h1>
            <div className="text-sm font-bold text-ink-soft">{ageFromBirthDate(child.birthDate) ?? "—"} años · Nivel {child.level}</div>
            <Link href={`/profile/edit/${child.id}`} className="inline-block mt-2 text-xs font-bold text-sky underline">✏️ Editar perfil</Link>

            {user.children.length > 1 && (
              <div className="mt-5">
                <div className="text-[10px] font-black text-ink-soft tracking-widest mb-2">CAMBIAR DE PERFIL</div>
                <ChildSwitcher children={user.children} activeId={child.id}/>
              </div>
            )}
            <div className="mt-3 flex flex-col items-center md:items-start gap-2">
              <Link href="/profile/create" className="text-xs font-bold text-ink-soft underline">+ Agregar hijo</Link>
              <Link href="/settings" className="text-xs font-bold text-pink underline">🚪 Cerrar sesión</Link>
            </div>
          </aside>

          <section className="mt-6 md:mt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "🔥", value: child.streak, label: "DÍAS RACHA" },
                { icon: "⭐", value: child.xp, label: "XP GANADO" },
                { icon: "📚", value: lessonsCompleted, label: "LECCIONES" },
                { icon: "🎯", value: `${accuracy}%`, label: "ACIERTOS" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-4" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
                  <div className="text-3xl">{s.icon}</div>
                  <div className="font-fredoka text-2xl font-bold text-ink mt-1">{s.value}</div>
                  <div className="text-[10px] font-bold text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>

            {/* SRS · estado de cada concepto que ya vio */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { icon: "🏅", value: masteryStats.mastered, label: "DOMINADOS", tone: "bg-mint-soft border-mint" },
                { icon: "📖", value: masteryStats.learning, label: "APRENDIENDO", tone: "bg-sky-soft border-sky" },
                { icon: "🔁", value: masteryStats.dueToday, label: "REPASAR HOY", tone: "bg-peach-soft border-pink" },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`${s.tone} rounded-2xl p-4 border-2`}
                  style={{ boxShadow: "var(--shadow-chunky-sm)" }}
                >
                  <div className="text-2xl">{s.icon}</div>
                  <div className="font-fredoka text-2xl font-bold text-ink mt-1">{s.value}</div>
                  <div className="text-[10px] font-bold text-ink-soft">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-3 gap-3">
              <Link href="/achievements" className="btn-chunky flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
                <span>🏆 Medallas</span><span className="text-ink-mute">›</span>
              </Link>
              <Link href="/shop" className="btn-chunky flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
                <span>🛍️ Tienda de {brand.mascotName}</span><span className="text-ink-mute">›</span>
              </Link>
              <Link href="/premium" className="btn-chunky flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
                <span>{isPremium ? "👑 Premium activo" : premiumState === "expired" ? "👑 Premium vencido" : "👑 Activar Premium"}</span><span className="text-ink-mute">›</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}
