import { notFound } from "next/navigation";
import { requireUser, isAdminEmail } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { premiumStatus } from "@/lib/premium";
import { AdminPremiumClient } from "./AdminPremiumClient";

export const dynamic = "force-dynamic";

export default async function AdminPremiumPage() {
  const admin = await requireUser();
  if (!isAdminEmail(admin.email)) notFound();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      premiumUntil: true,
      premiumAssignedAt: true,
      premiumNote: true,
      _count: { select: { children: true } },
    },
  });

  const grants = await prisma.premiumGrant.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      user: { select: { email: true, name: true } },
      adminUser: { select: { email: true, name: true } },
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <header className="mb-7">
        <div className="text-xs font-black uppercase tracking-widest text-[#4867f5]">
          Admin
        </div>
        <h1 className="mt-1 font-fredoka text-3xl font-bold text-slate-950">
          Premium
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
          Cambia manualmente el plan de las cuentas. Esto no usa pagos todavía:
          Premium se determina por el plan y su vigencia; si no hay fecha, se
          considera una activación manual indefinida.
        </p>
      </header>

      <AdminPremiumClient
        users={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          premiumUntil: user.premiumUntil?.toISOString() ?? null,
          premiumAssignedAt: user.premiumAssignedAt?.toISOString() ?? null,
          premiumNote: user.premiumNote,
          status: premiumStatus(user),
          childrenCount: user._count.children,
        }))}
        grants={grants.map((grant) => ({
          id: grant.id,
          plan: grant.plan,
          userLabel: grant.user.name || grant.user.email,
          adminLabel: grant.adminUser?.name || grant.adminUser?.email || "Admin eliminado",
          startsAt: grant.startsAt.toISOString(),
          endsAt: grant.endsAt?.toISOString() ?? null,
          note: grant.note,
          createdAt: grant.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
