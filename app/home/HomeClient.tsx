"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  Shield,
  Star,
  Zap,
} from "lucide-react";

type NodeStatus = "done" | "current" | "available" | "locked";

type LessonNode = {
  id: string;
  label: string;
  status: NodeStatus;
  stars: number;
};

type UnitSlide = {
  slug: string;
  title: string;
  order: number;
  icon: string | null;
  description: string | null;
  progressPct: number;
  lessons: LessonNode[];
};

type HomeStats = {
  childName: string;
  streak: number;
  hearts: number;
  gems: number;
  xp: number;
  weeklyXp: number;
  league: string;
  myRank: number | null;
  activeDaysThisWeek: number;
  isPremium: boolean;
  premiumUntil: string | null;
  premiumStatus: "free" | "active" | "expiring_soon" | "expired";
  premiumUntilLabel: string | null;
};

type LeaderboardRow = {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  isMe: boolean;
};

function pickStartLesson(unit: UnitSlide) {
  return (
    unit.lessons.find((node) => node.status === "current") ??
    unit.lessons.find((node) => node.status === "available") ??
    unit.lessons.find((node) => node.status === "done") ??
    null
  );
}

function lessonStateLabel(node: LessonNode) {
  if (node.status === "done") return `${node.stars}/3 estrellas`;
  if (node.status === "current") return "Lista para jugar";
  if (node.status === "available") return "Disponible";
  return "Bloqueada";
}

function formatLeagueName(league: string) {
  const normalized = league.toLowerCase();
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} League`;
}

export function HomeClient({
  pathName,
  pathHref,
  units,
  initialUnitSlug,
  reviewsDue,
  stats,
  leaderboardRows,
}: {
  pathName: string;
  pathHref: string;
  units: UnitSlide[];
  initialUnitSlug: string | null;
  reviewsDue: number;
  stats: HomeStats;
  leaderboardRows: LeaderboardRow[];
}) {
  const initialIndex = Math.max(
    0,
    units.findIndex((unit) => unit.slug === initialUnitSlug),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeUnit = units[activeIndex] ?? units[0] ?? null;
  const currentLesson = activeUnit ? pickStartLesson(activeUnit) : null;
  const startHref = currentLesson ? `/lesson/${currentLesson.id}` : pathHref;
  const doneCount =
    activeUnit?.lessons.filter((node) => node.status === "done").length ?? 0;
  const weekDays = ["L", "M", "X", "J", "V"];

  const previewLessons = useMemo(
    () => activeUnit?.lessons.slice(0, 2) ?? [],
    [activeUnit],
  );

  function goTo(delta: number) {
    if (units.length <= 1) return;
    setActiveIndex((current) => (current + delta + units.length) % units.length);
  }

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-6 md:grid-cols-[390px_minmax(0,1fr)] md:px-8 md:py-10">
        <aside className="order-2 space-y-5 md:order-1">
          <section className="hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_2px_0_rgba(15,23,42,0.06)] md:block">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-fredoka text-5xl font-bold text-slate-950">
                    {stats.streak}
                  </div>
                  <Zap className="h-8 w-8 text-slate-200" aria-hidden />
                </div>
                <p className="mt-3 text-lg font-semibold text-slate-800">
                  {stats.streak > 0
                    ? `${stats.childName} mantiene su racha`
                    : "Resolvé 3 problemas para iniciar una racha"}
                </p>
                <div className="mt-2 flex gap-3 text-xs font-black text-slate-400">
                  <span>⭐ {stats.xp} XP</span>
                  <span>💎 {stats.gems}</span>
                </div>
              </div>
              <div className="flex gap-1 text-slate-200">
                {Array.from({
                  length: Math.max(1, Math.min(5, stats.hearts)),
                }).map((_, index) => (
                  <Heart key={index} className="h-5 w-5" aria-hidden />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-5 gap-3">
              {weekDays.map((day, index) => {
                const active = index < stats.activeDaysThisWeek;
                return (
                  <div key={day} className="text-center">
                    <div
                      className={`mx-auto grid h-12 w-12 place-items-center rounded-full border-2 ${
                        active
                          ? "border-[#4867f5] bg-[#eef3ff] text-[#4867f5]"
                          : "border-slate-100 bg-white text-slate-200"
                      }`}
                    >
                      <Zap className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="mt-2 text-xs font-black text-slate-600">
                      {day}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Link
            href="/premium"
            className={`block overflow-hidden rounded-2xl border border-slate-200 p-3 shadow-[0_2px_0_rgba(15,23,42,0.06)] md:rounded-3xl md:p-5 ${
              stats.isPremium
                ? "bg-[#f7fff9]"
                : "bg-linear-to-br from-[#f0ecff] via-[#ffe5f2] to-[#fff5c7]"
            }`}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/80 text-[#4867f5] shadow-sm md:h-16 md:w-16 md:rounded-2xl">
                <Crown className="h-6 w-6 md:h-9 md:w-9" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="font-fredoka text-sm font-bold text-slate-950 md:text-lg">
                  {stats.isPremium
                    ? "Premium activo"
                    : stats.premiumStatus === "expired"
                      ? "Premium vencido"
                      : "Desbloqueá todo con Premium"}
                </div>
                <div className="line-clamp-1 text-xs font-semibold text-slate-700 md:line-clamp-none md:text-sm md:leading-6">
                  {stats.isPremium
                    ? stats.premiumUntilLabel
                      ? `Acceso hasta ${stats.premiumUntilLabel}.`
                      : "Tu cuenta ya tiene acceso a caminos premium."
                    : stats.premiumStatus === "expired"
                      ? "Renová para volver a entrar a caminos premium."
                      : "Más caminos, repasos y retos para avanzar mejor."}
                </div>
              </div>
            </div>
            {!stats.isPremium && (
              <div className="mt-3 rounded-full bg-linear-to-r from-[#8f7cf7] via-[#f276c8] to-[#ffc247] px-4 py-2 text-center text-xs font-black text-slate-950 shadow-[0_4px_0_rgba(86,54,7,0.25)] md:mt-5 md:px-5 md:py-3 md:text-sm md:shadow-[0_5px_0_rgba(86,54,7,0.25)]">
                Explorar Premium
              </div>
            )}
          </Link>

          <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_2px_0_rgba(15,23,42,0.06)] md:block">
            <div className="flex items-center gap-4 border-b border-slate-100 p-5">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#fff3d3] text-[#b56a00]">
                <Shield className="h-8 w-8" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black uppercase tracking-wide text-slate-950">
                  {formatLeagueName(stats.league)}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {stats.weeklyXp} XP esta semana
                </div>
              </div>
              <div className="rounded-full bg-[#eef3ff] px-3 py-1 text-xs font-black text-[#4867f5]">
                {stats.myRank ? `#${stats.myRank}` : "Nuevo"}
              </div>
            </div>
            <div className="space-y-2 px-5 py-4">
              {leaderboardRows.length > 0 ? (
                leaderboardRows.map((row) => (
                  <div
                    key={`${row.rank}-${row.name}`}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
                      row.isMe
                        ? "bg-[#eef3ff] ring-2 ring-[#b9c6ff]"
                        : "bg-slate-50"
                    }`}
                  >
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full font-fredoka text-sm font-bold ${
                        row.rank <= 3
                          ? "bg-[#ffd76a] text-slate-950"
                          : "bg-white text-slate-500"
                      }`}
                    >
                      {row.rank}
                    </div>
                    <div className="text-2xl" aria-hidden>
                      {row.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-fredoka text-sm font-bold text-slate-950">
                        {row.name}
                        {row.isMe ? " (vos)" : ""}
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-500">
                      {row.xp} XP
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center">
                  <div className="text-4xl" aria-hidden>
                    🏁
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                    La liga aparece cuando completás tu primera lección.
                  </p>
                </div>
              )}
            </div>
          </section>
        </aside>

        <section className="order-1 min-w-0 md:order-2">
          {activeUnit && (
            <div className="relative flex min-h-[500px] flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_0_rgba(15,23,42,0.06)] md:min-h-[620px] md:p-8">
              <div className="absolute -left-4 top-7 hidden h-[82%] w-4 rounded-l-3xl border-y border-l border-slate-200 bg-white md:block" />
              <div className="absolute -left-7 top-12 hidden h-[73%] w-4 rounded-l-3xl border-y border-l border-slate-200 bg-white md:block" />

              <div className="flex items-center justify-between gap-2 md:gap-3">
                <button
                  type="button"
                  onClick={() => goTo(-1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#4867f5] md:h-10 md:w-10"
                  aria-label="Unidad anterior"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <div className="min-w-0 flex-1 text-center">
                  <div className="inline-flex rounded-full bg-[#dfe6ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#4867f5] md:px-3 md:text-xs">
                    Recomendado
                  </div>
                  <h1 className="mt-2 line-clamp-2 font-fredoka text-2xl font-bold leading-tight text-slate-950 md:text-4xl">
                    {activeUnit.title}
                  </h1>
                  <div className="mt-1 text-xs font-black uppercase text-[#4867f5] md:mt-2 md:text-sm">
                    {pathName} · Unidad {activeUnit.order}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#4867f5] md:h-10 md:w-10"
                  aria-label="Unidad siguiente"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </div>

              {activeUnit.description && (
                <p className="mx-auto mt-3 hidden max-w-md text-center text-sm font-semibold leading-6 text-slate-500 md:block">
                  {activeUnit.description}
                </p>
              )}

              <div className="mx-auto mt-6 grid h-20 w-28 place-items-center rounded-[1.5rem] bg-[#eef3ff] text-5xl shadow-inner md:mt-9 md:h-28 md:w-36 md:rounded-[2rem] md:text-6xl">
                {activeUnit.icon ?? "🧩"}
              </div>

              <div className="mx-auto mt-5 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 md:mt-6 md:max-w-sm">
                <div
                  className="h-full rounded-full bg-[#4867f5]"
                  style={{ width: `${activeUnit.progressPct * 100}%` }}
                />
              </div>
              <div className="mt-2 hidden text-center text-xs font-black uppercase tracking-wide text-slate-400 md:block">
                {doneCount}/{activeUnit.lessons.length} lecciones completas
              </div>

              <div className="mt-6 space-y-3 md:mt-9 md:space-y-4">
                {previewLessons.map((node) => {
                  const isCurrent = node.status === "current";
                  const isDone = node.status === "done";
                  const isLocked = node.status === "locked";
                  return (
                    <div
                      key={node.id}
                      className={`flex items-center gap-3 rounded-2xl px-2.5 py-2 md:gap-4 md:px-3 ${
                        isCurrent ? "bg-[#f7f9ff]" : ""
                      }`}
                    >
                      <div
                        className={`grid h-10 w-14 shrink-0 place-items-center rounded-full border-[5px] md:h-12 md:w-16 md:border-[6px] ${
                          isLocked
                            ? "border-slate-100 bg-slate-200 text-slate-400"
                            : isDone
                              ? "border-[#dce4ff] bg-[#4867f5] text-white"
                              : "border-[#dce4ff] bg-white text-[#4867f5]"
                        }`}
                      >
                        {isDone ? (
                          "✓"
                        ) : isLocked ? (
                          "•"
                        ) : (
                          <Star className="h-5 w-5" aria-hidden />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`line-clamp-1 font-fredoka text-base font-bold md:text-lg ${
                            isLocked ? "text-slate-400" : "text-slate-950"
                          }`}
                        >
                          {node.label}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wide text-slate-400 md:text-xs">
                          {lessonStateLabel(node)}
                        </div>
                      </div>
                      <div
                        className={`hidden h-5 w-5 rounded-full md:block ${
                          isCurrent ? "bg-slate-300" : "bg-slate-200"
                        }`}
                        aria-hidden
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto pt-5 md:pt-6">
                <Link
                  href={startHref}
                  className="btn-chunky block w-full rounded-2xl bg-[#4867f5] px-5 py-3.5 text-center text-sm font-black text-white shadow-[0_5px_0_#2445d8] hover:bg-[#3d5df0] md:px-6 md:py-4 md:text-base"
                >
                  {currentLesson?.status === "done" ? "Repasar" : "Start"}
                </Link>
              </div>
            </div>
          )}

          <div className="mt-5 hidden flex-wrap justify-center gap-3 md:flex">
            {units.map((unit, index) => (
              <button
                key={unit.slug}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? "page" : undefined}
                className={`grid h-16 w-20 place-items-center rounded-xl border-2 bg-white text-3xl shadow-[0_2px_0_rgba(15,23,42,0.06)] ${
                  index === activeIndex
                    ? "border-[#6d86ff]"
                    : "border-slate-200 hover:border-[#b9c6ff]"
                }`}
                title={unit.title}
              >
                {unit.icon ?? "🧩"}
              </button>
            ))}
          </div>

          <div className="mt-5 hidden justify-center gap-4 text-sm font-bold md:flex">
            <Link href={pathHref} className="text-[#4867f5]">
              Ver camino completo
            </Link>
            <Link href="/review" className="text-slate-500">
              Repaso {reviewsDue > 0 ? `(${reviewsDue})` : ""}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
