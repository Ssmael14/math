"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { brand } from "@/lib/brand";
import {
  isSoundsEnabled,
  isHapticsEnabled,
  setSoundsEnabled,
  setHapticsEnabled,
  playCorrect,
} from "@/lib/gamification/audio";

type SubscriptionPlan = "FREE" | "PREMIUM" | "FAMILY";
type PremiumStatus = "free" | "active" | "expiring_soon" | "expired";

function planLabel(plan: SubscriptionPlan) {
  if (plan === "FAMILY") return "Family";
  if (plan === "PREMIUM") return "Premium";
  return "Free";
}

export function SettingsClient({
  plan,
  isPremium,
  premiumStatus,
  premiumUntilLabel,
}: {
  plan: SubscriptionPlan;
  isPremium: boolean;
  premiumStatus: PremiumStatus;
  premiumUntilLabel: string | null;
}) {
  const router = useRouter();
  const [sound, setSound] = useState(true);
  const [haptic, setHaptic] = useState(true);
  const [notif, setNotif] = useState(true);

  useEffect(() => {
    setSound(isSoundsEnabled());
    setHaptic(isHapticsEnabled());
  }, []);

  function toggleSound(next: boolean) {
    setSound(next);
    setSoundsEnabled(next);
    if (next) playCorrect();
  }

  function toggleHaptic(next: boolean) {
    setHaptic(next);
    setHapticsEnabled(next);
  }

  async function handleLogout() {
    await authClient.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-cream">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-2xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center gap-3">
          <Link
            href="/profile"
            className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink"
            style={{ boxShadow: "var(--shadow-chunky-sm)" }}
          >
            ←
          </Link>
          <h1 className="font-fredoka text-lg md:text-2xl font-bold text-ink">
            ⚙️ Ajustes
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
          <Section title="Premium">
            <Link
              href="/premium"
              className={`btn-chunky w-full flex items-center justify-between rounded-2xl p-4 font-bold ${
                isPremium ? "bg-sun-soft text-ink" : "bg-white text-ink"
              }`}
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <span>
                {isPremium
                  ? `👑 Premium activo · ${planLabel(plan)}`
                  : premiumStatus === "expired"
                    ? "👑 Premium vencido"
                  : "👑 Activar Premium"}
              </span>
              <span className="text-ink-mute">
                {isPremium && premiumUntilLabel ? premiumUntilLabel : "›"}
              </span>
            </Link>
          </Section>

          <Section title="Sonido y vibración">
            <Toggle
              label="🔊 Efectos de sonido"
              value={sound}
              onChange={toggleSound}
            />
            <Toggle
              label="📳 Vibración"
              value={haptic}
              onChange={toggleHaptic}
            />
          </Section>

          <Section title="Notificaciones">
            <Toggle
              label="🔔 Recordatorios diarios"
              value={notif}
              onChange={setNotif}
            />
          </Section>

          <Section title="Cuenta">
            <Link
              href="/parental"
              className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink"
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <span>👨‍👩‍👧 Modo padres</span>
              <span className="text-ink-mute">›</span>
            </Link>
            <Link
              href="/settings/pin"
              className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink"
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <span>🔒 Cambiar PIN parental</span>
              <span className="text-ink-mute">›</span>
            </Link>
            <Link
              href="/auth/forgot"
              className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink"
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <span>🔑 Cambiar contraseña</span>
              <span className="text-ink-mute">›</span>
            </Link>
            <button
              onClick={handleLogout}
              className="btn-chunky w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-pink mt-2"
              style={{ boxShadow: "var(--shadow-chunky-sm)" }}
            >
              <span>🚪 Cerrar sesión</span>
              <span className="text-ink-mute">›</span>
            </button>
          </Section>

          <div className="text-center text-xs font-bold text-ink-mute pt-4">
            {brand.appName} v0.1 · Hecho con {brand.mascotName} y matemática
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-black text-ink-soft tracking-widest mb-2 px-1">
        {title.toUpperCase()}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between bg-white rounded-2xl p-4 font-bold text-ink"
      style={{ boxShadow: "var(--shadow-chunky-sm)" }}
    >
      <span>{label}</span>
      <div
        className={`w-12 h-7 rounded-full p-1 transition-colors ${value ? "bg-mint" : "bg-cream"}`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`}
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.15)" }}
        />
      </div>
    </button>
  );
}
