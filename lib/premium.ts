import type { SubscriptionPlan } from "@prisma/client";

export type PremiumUser = {
  plan: SubscriptionPlan;
  premiumUntil: Date | null;
};

export type PremiumStatus = "free" | "active" | "expiring_soon" | "expired";

export function hasPremiumAccess(user: PremiumUser, now = new Date()) {
  return user.plan !== "FREE" && Boolean(user.premiumUntil && user.premiumUntil > now);
}

export function premiumStatus(user: PremiumUser, now = new Date()): PremiumStatus {
  if (user.plan === "FREE") return "free";
  if (!user.premiumUntil || user.premiumUntil <= now) return "expired";

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  if (user.premiumUntil.getTime() - now.getTime() <= sevenDaysMs) {
    return "expiring_soon";
  }

  return "active";
}

export function addMonthsUtc(date: Date, months: number) {
  const copy = new Date(date);
  copy.setUTCMonth(copy.getUTCMonth() + months);
  return copy;
}

export function addDaysUtc(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function formatPremiumDate(date: Date | null | undefined) {
  if (!date) return null;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
