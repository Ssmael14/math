import { SubscriptionPlan } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { addMonthsUtc } from "@/lib/premium";
import { rateLimit } from "@/lib/rate-limit";

const plans = new Set<string>(Object.values(SubscriptionPlan));

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const admin = await getCurrentUser();
  if (!admin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(admin.email)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const limited = rateLimit(`admin:premium:${admin.id}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const data =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const plan = data?.plan;
  if (typeof plan !== "string" || !plans.has(plan)) {
    return NextResponse.json({ error: "invalid_plan" }, { status: 400 });
  }
  const note =
    data && typeof data.note === "string"
      ? data.note.trim().slice(0, 500)
      : null;

  const now = new Date();
  let premiumUntil: Date | null = null;

  if (plan !== SubscriptionPlan.FREE) {
    const months =
      data && Number.isInteger(data.months)
        ? Number(data.months)
        : null;
    const manualUntil =
      data && typeof data.premiumUntil === "string"
        ? new Date(data.premiumUntil)
        : null;

    if (manualUntil && Number.isNaN(manualUntil.getTime())) {
      return NextResponse.json({ error: "invalid_premium_until" }, { status: 400 });
    }

    if (manualUntil) {
      premiumUntil = manualUntil;
    } else if (months && [1, 3, 6, 12].includes(months)) {
      premiumUntil = addMonthsUtc(now, months);
    } else {
      return NextResponse.json({ error: "duration_required" }, { status: 400 });
    }

    if (premiumUntil <= now) {
      return NextResponse.json({ error: "premium_until_in_past" }, { status: 400 });
    }
  }

  const { userId } = await params;
  const exists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        plan: plan as SubscriptionPlan,
        premiumUntil,
        premiumAssignedAt: plan === SubscriptionPlan.FREE ? null : now,
        premiumNote: note,
      },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        premiumUntil: true,
        premiumAssignedAt: true,
        premiumNote: true,
        updatedAt: true,
      },
    });

    await tx.premiumGrant.create({
      data: {
        userId,
        adminUserId: admin.id,
        plan: plan as SubscriptionPlan,
        startsAt: now,
        endsAt: premiumUntil,
        note,
      },
    });

    return updated;
  });

  return NextResponse.json({ user });
}
