// app/home/page.tsx - Daily learning dashboard for the active path.
import { redirect } from "next/navigation";
import {
  getActiveChild,
  getActiveEnrollment,
  getLeaderboard,
  getLearningPathBySlug,
  getMasteryStats,
  getUnitsWithProgress,
} from "@/lib/queries";
import { mondayOfWeek } from "@/lib/gamification/scoring";
import { getCurrentUser } from "@/lib/auth/server";
import { formatPremiumDate, hasPremiumAccess, premiumStatus } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import { TopNav } from "@/components/TopNav";
import { HomeClient } from "./HomeClient";

type UnitWithProgress = Awaited<ReturnType<typeof getUnitsWithProgress>>[number];

function pickActiveUnit(
  units: UnitWithProgress[],
  requestedSlug: string | undefined,
) {
  if (units.length === 0) return null;
  if (requestedSlug) {
    const found = units.find((unit) => unit.slug === requestedSlug);
    if (found) return found;
  }

  return units.find((unit) => unit.progress < 1) ?? units[0];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ unit?: string; path?: string }>;
}) {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { unit: requestedUnitSlug, path: requestedPathSlug } =
    await searchParams;

  let activePath = null;
  if (requestedPathSlug) {
    activePath = await getLearningPathBySlug(requestedPathSlug);
  }
  if (!activePath) {
    const enrollment = await getActiveEnrollment(child.id);
    if (!enrollment) redirect("/subjects");
    activePath = enrollment.learningPath;
  }

  const weekStart = mondayOfWeek();
  const [units, masteryStats, weeklyXp, activeDaysThisWeek] =
    await Promise.all([
      getUnitsWithProgress(child.id, activePath.id),
      getMasteryStats(child.id),
      prisma.weeklyXP.findUnique({
        where: { childId_weekStart: { childId: child.id, weekStart } },
      }),
      prisma.progress.findMany({
        where: {
          childId: child.id,
          completed: true,
          completedAt: { gte: weekStart },
        },
        select: { completedAt: true },
      }),
    ]);

  const unit = pickActiveUnit(units, requestedUnitSlug);

  if (!unit) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-white">
        <TopNav />
        <div className="p-8 text-center">
          <h1 className="font-fredoka text-2xl font-bold text-ink">
            Path sin unidades
          </h1>
          <p className="mt-2 text-ink-soft">
            El path "{activePath.name}" no tiene unidades cargadas.
          </p>
        </div>
      </div>
    );
  }

  const activeDayKeys = new Set(
    activeDaysThisWeek
      .map((progress) => progress.completedAt)
      .filter((date): date is Date => Boolean(date))
      .map((date) => date.toISOString().slice(0, 10)),
  );
  const currentLeague = weeklyXp?.league ?? "DIAMOND";
  const leaderboard = await getLeaderboard(child.id, currentLeague);
  const pathHref = `/paths/${activePath.slug}`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <TopNav />
      <HomeClient
        pathName={activePath.name}
        pathHref={pathHref}
        initialUnitSlug={unit.slug}
        units={units.map((entry) => ({
          slug: entry.slug,
          title: entry.title,
          order: entry.order,
          icon: entry.icon,
          description: entry.description,
          progressPct: entry.progress,
          lessons: entry.lessons.map((lesson) => ({
            id: lesson.id,
            label: lesson.title,
            status: lesson.status,
            stars: lesson.stars,
          })),
        }))}
        reviewsDue={masteryStats.dueToday}
        stats={{
          childName: child.name,
          streak: child.streak,
          hearts: child.hearts,
          gems: child.gems,
          xp: child.xp,
          weeklyXp: weeklyXp?.xp ?? 0,
          league: leaderboard.league,
          myRank: leaderboard.myRank,
          activeDaysThisWeek: Math.min(activeDayKeys.size, 5),
          isPremium: hasPremiumAccess(user),
          premiumUntil: user.premiumUntil?.toISOString() ?? null,
          premiumStatus: premiumStatus(user),
          premiumUntilLabel: formatPremiumDate(user.premiumUntil),
        }}
        leaderboardRows={leaderboard.rows.slice(0, 5)}
      />
    </div>
  );
}
