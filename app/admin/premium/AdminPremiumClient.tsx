"use client";

import { useMemo, useState, useTransition } from "react";

type SubscriptionPlan = "FREE" | "PREMIUM" | "FAMILY";
type PremiumStatus = "free" | "active" | "expiring_soon" | "expired";
type DurationOption = "1" | "3" | "6" | "12" | "manual";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  plan: SubscriptionPlan;
  premiumUntil: string | null;
  premiumAssignedAt: string | null;
  premiumNote: string | null;
  status: PremiumStatus;
  childrenCount: number;
};

type PremiumGrantRow = {
  id: string;
  plan: SubscriptionPlan;
  userLabel: string;
  adminLabel: string;
  startsAt: string;
  endsAt: string | null;
  note: string | null;
  createdAt: string;
};

type Draft = {
  plan: SubscriptionPlan;
  duration: DurationOption;
  premiumUntil: string;
  note: string;
};

const planOptions = ["FREE", "PREMIUM", "FAMILY"] as const;
const durationOptions: { value: DurationOption; label: string }[] = [
  { value: "1", label: "1 mes" },
  { value: "3", label: "3 meses" },
  { value: "6", label: "6 meses" },
  { value: "12", label: "12 meses" },
  { value: "manual", label: "Fecha manual" },
];

function planLabel(plan: SubscriptionPlan) {
  if (plan === "FAMILY") return "Family";
  if (plan === "PREMIUM") return "Premium";
  return "Free";
}

function statusLabel(status: PremiumStatus) {
  if (status === "active") return "Activo";
  if (status === "expiring_soon") return "Vence pronto";
  if (status === "expired") return "Vencido";
  return "Free";
}

function statusClasses(status: PremiumStatus) {
  if (status === "active") return "bg-[#ecfff2] text-[#168a3a]";
  if (status === "expiring_soon") return "bg-[#fff3d3] text-[#b56a00]";
  if (status === "expired") return "bg-[#ffe8ee] text-[#c93658]";
  return "bg-slate-100 text-slate-500";
}

function dateLabel(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function clientStatus(plan: SubscriptionPlan, premiumUntil: string | null): PremiumStatus {
  if (plan === "FREE") return "free";
  if (!premiumUntil) return "expired";
  const until = new Date(premiumUntil);
  const now = new Date();
  if (until <= now) return "expired";
  if (until.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000) {
    return "expiring_soon";
  }
  return "active";
}

function initialDraft(user: AdminUser): Draft {
  return {
    plan: user.plan,
    duration: "1",
    premiumUntil: user.premiumUntil?.slice(0, 10) ?? "",
    note: user.premiumNote ?? "",
  };
}

export function AdminPremiumClient({
  users,
  grants,
}: {
  users: AdminUser[];
  grants: PremiumGrantRow[];
}) {
  const [rows, setRows] = useState(users);
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(users.map((user) => [user.id, initialDraft(user)])),
  );
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((user) => {
      const name = user.name?.toLowerCase() ?? "";
      return (
        user.email.toLowerCase().includes(term) ||
        name.includes(term) ||
        user.plan.toLowerCase().includes(term) ||
        statusLabel(user.status).toLowerCase().includes(term)
      );
    });
  }, [query, rows]);

  function patchDraft(userId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [userId]: { ...current[userId], ...patch },
    }));
  }

  function updatePlan(userId: string) {
    const draft = drafts[userId];
    if (!draft) return;

    setMessage(null);
    setActiveUserId(userId);
    startTransition(async () => {
      const payload: {
        plan: SubscriptionPlan;
        months?: number;
        premiumUntil?: string;
        note?: string;
      } = {
        plan: draft.plan,
        note: draft.note.trim() || undefined,
      };

      if (draft.plan !== "FREE") {
        if (draft.duration === "manual") {
          payload.premiumUntil = draft.premiumUntil
            ? new Date(`${draft.premiumUntil}T23:59:59.000Z`).toISOString()
            : undefined;
        } else {
          payload.months = Number(draft.duration);
        }
      }

      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        setMessage(
          error?.error === "duration_required"
            ? "Elige duración o fecha manual para Premium."
            : "No se pudo actualizar el plan. Revisa permisos o fecha.",
        );
        setActiveUserId(null);
        return;
      }

      const result = (await response.json()) as {
        user: {
          id: string;
          plan: SubscriptionPlan;
          premiumUntil: string | null;
          premiumAssignedAt: string | null;
          premiumNote: string | null;
        };
      };

      setRows((current) =>
        current.map((user) =>
          user.id === result.user.id
            ? {
                ...user,
                plan: result.user.plan,
                premiumUntil: result.user.premiumUntil,
                premiumAssignedAt: result.user.premiumAssignedAt,
                premiumNote: result.user.premiumNote,
                status: clientStatus(result.user.plan, result.user.premiumUntil),
              }
            : user,
        ),
      );
      setMessage("Plan actualizado.");
      setActiveUserId(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_2px_0_rgba(15,23,42,0.06)]">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
          Buscar usuario
        </label>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nombre, email, plan o estado"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-[#4867f5]"
        />
      </div>

      {message && (
        <div className="rounded-2xl bg-[#eef3ff] px-4 py-3 text-sm font-bold text-[#2445d8]">
          {message}
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-sm font-semibold text-slate-500">
            No hay usuarios con ese filtro.
          </div>
        ) : (
          filtered.map((user) => {
            const draft = drafts[user.id] ?? initialDraft(user);
            const isUpdating = pending && activeUserId === user.id;
            return (
              <section
                key={user.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)]"
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-fredoka text-lg font-bold text-slate-950">
                        {user.name || "Sin nombre"}
                      </h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase ${statusClasses(user.status)}`}
                      >
                        {statusLabel(user.status)}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-sm font-semibold text-slate-500">
                      {user.email}
                    </div>
                    <div className="mt-2 text-xs font-bold text-slate-400">
                      {user.childrenCount} perfil
                      {user.childrenCount === 1 ? "" : "es"} infantil · Plan{" "}
                      {planLabel(user.plan)} · Vence {dateLabel(user.premiumUntil)}
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <select
                      value={draft.plan}
                      disabled={isUpdating}
                      onChange={(event) =>
                        patchDraft(user.id, {
                          plan: event.target.value as SubscriptionPlan,
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
                      aria-label={`Cambiar plan de ${user.email}`}
                    >
                      {planOptions.map((plan) => (
                        <option key={plan} value={plan}>
                          {planLabel(plan)}
                        </option>
                      ))}
                    </select>

                    <select
                      value={draft.duration}
                      disabled={isUpdating || draft.plan === "FREE"}
                      onChange={(event) =>
                        patchDraft(user.id, {
                          duration: event.target.value as DurationOption,
                        })
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {draft.duration === "manual" && draft.plan !== "FREE" && (
                      <input
                        type="date"
                        value={draft.premiumUntil}
                        disabled={isUpdating}
                        onChange={(event) =>
                          patchDraft(user.id, { premiumUntil: event.target.value })
                        }
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-950 disabled:opacity-60"
                      />
                    )}

                    <input
                      value={draft.note}
                      disabled={isUpdating}
                      onChange={(event) =>
                        patchDraft(user.id, { note: event.target.value })
                      }
                      placeholder="Nota interna"
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                    />

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => updatePlan(user.id)}
                      className="btn-chunky rounded-2xl bg-[#4867f5] px-4 py-3 text-sm font-black text-white shadow-[0_4px_0_#2445d8] disabled:opacity-60 sm:col-span-2"
                    >
                      {isUpdating ? "Guardando..." : "Guardar plan"}
                    </button>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)]">
        <h2 className="font-fredoka text-xl font-bold text-slate-950">
          Historial reciente
        </h2>
        <div className="mt-4 space-y-2">
          {grants.length === 0 ? (
            <div className="text-sm font-semibold text-slate-500">
              Todavía no hay asignaciones registradas.
            </div>
          ) : (
            grants.map((grant) => (
              <div
                key={grant.id}
                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm"
              >
                <div className="font-bold text-slate-950">
                  {grant.userLabel} → {planLabel(grant.plan)}
                </div>
                <div className="mt-1 font-semibold text-slate-500">
                  Admin: {grant.adminLabel} · Vence {dateLabel(grant.endsAt)}
                </div>
                {grant.note && (
                  <div className="mt-1 font-semibold text-slate-400">
                    Nota: {grant.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
