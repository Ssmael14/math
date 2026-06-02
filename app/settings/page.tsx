import { requireUser } from "@/lib/auth/server";
import { formatPremiumDate, hasPremiumAccess, premiumStatus } from "@/lib/premium";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <SettingsClient
      plan={user.plan}
      isPremium={hasPremiumAccess(user)}
      premiumStatus={premiumStatus(user)}
      premiumUntilLabel={formatPremiumDate(user.premiumUntil)}
    />
  );
}
