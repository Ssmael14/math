// app/home/page.tsx - Daily learning dashboard for the active path.
import { redirect } from "next/navigation";
import {
  getActiveChild,
  getActiveEnrollment,
  getEnrollments,
  getLeaderboard,
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

  const enrollments = await getEnrollments(child.id);
  if (enrollments.length === 0) redirect("/subjects");

  const requestedEnrollment = requestedPathSlug
    ? enrollments.find(
        (enrollment) => enrollment.learningPath.slug === requestedPathSlug,
      )
    : null;
  const activeEnrollment =
    requestedEnrollment ?? (await getActiveEnrollment(child.id)) ?? enrollments[0];
  const activePath = activeEnrollment.learningPath;

  const weekStart = mondayOfWeek();
  const [coursesWithUnits, masteryStats, weeklyXp, activeDaysThisWeek] =
    await Promise.all([
      Promise.all(
        enrollments.map(async (enrollment) => ({
          enrollment,
          units: await getUnitsWithProgress(
            child.id,
            enrollment.learningPath.id,
          ),
        })),
      ),
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

  const activeDayKeys = new Set(
    activeDaysThisWeek
      .map((progress) => progress.completedAt)
      .filter((date): date is Date => Boolean(date))
      .map((date) => date.toISOString().slice(0, 10)),
  );
  const currentLeague = weeklyXp?.league ?? "DIAMOND";
  const leaderboard = await getLeaderboard(child.id, currentLeague);
  const premiumAccess = hasPremiumAccess(user);
  const courses = coursesWithUnits.map(({ enrollment, units }) => {
    const path = enrollment.learningPath;
    const isActivePath = path.id === activePath.id;
    const activeUnit = pickActiveUnit(
      units,
      isActivePath ? requestedUnitSlug : undefined,
    );
    const currentLesson =
      activeUnit?.lessons.find((lesson) => lesson.status === "current") ??
      activeUnit?.lessons.find((lesson) => lesson.status === "available") ??
      activeUnit?.lessons.find((lesson) => lesson.status === "done") ??
      null;
    const freePreviewLesson = units[0]?.lessons[0] ?? null;
    const freePreviewDone = freePreviewLesson?.status === "done";
    const premiumLocked = path.isPremium && !premiumAccess && freePreviewDone;
    const playableLesson =
      path.isPremium && !premiumAccess && !freePreviewDone
        ? freePreviewLesson
        : premiumLocked
          ? null
          : currentLesson;
    const lessonsTotal = units.reduce(
      (sum, unit) => sum + unit.lessonsTotal,
      0,
    );
    const lessonsDone = units.reduce((sum, unit) => sum + unit.lessonsDone, 0);
    const unitsDone = units.filter((unit) => unit.progress >= 1).length;

    return {
      slug: path.slug,
      name: path.name,
      description: path.description,
      href: `/paths/${path.slug}`,
      isPremium: path.isPremium,
      premiumLocked,
      freePreviewDone,
      subject: {
        name: path.subject.name,
        slug: path.subject.slug,
        icon: path.subject.icon,
      },
      progressPct: lessonsTotal ? lessonsDone / lessonsTotal : 0,
      unitsTotal: units.length,
      unitsDone,
      lessonsTotal,
      lessonsDone,
      currentUnitTitle: activeUnit?.title ?? null,
      currentUnitIcon: activeUnit?.icon ?? null,
      currentLessonId: playableLesson?.id ?? null,
      units: units.slice(0, 4).map((unit) => ({
        slug: unit.slug,
        title: unit.title,
        order: unit.order,
        icon: unit.icon,
        progressPct: unit.progress,
      })),
    };
  });

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <TopNav />
      <HomeClient
        courses={courses}
        initialCourseSlug={activePath.slug}
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
