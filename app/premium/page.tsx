import Link from "next/link";
import { Crown, LockKeyhole, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/server";
import { formatPremiumDate, hasPremiumAccess, premiumStatus } from "@/lib/premium";
import { TopNav } from "@/components/TopNav";
import { brand } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const user = await getCurrentUser();
  const isPremium = user ? hasPremiumAccess(user) : false;
  const status = user ? premiumStatus(user) : "free";
  const premiumUntilLabel = formatPremiumDate(user?.premiumUntil);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <TopNav />

      <main className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 md:grid-cols-[1fr_360px] md:px-8 md:py-14">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3d3] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#b56a00]">
              <Crown className="h-4 w-4" aria-hidden />
              Premium
            </div>
            <h1 className="mt-5 font-fredoka text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Más caminos para seguir aprendiendo.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-500">
              Premium desbloquea caminos marcados como premium. Por ahora el
              acceso se activa manualmente por el equipo de {brand.appName}, sin pagos
              dentro de la app.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <LockKeyhole className="h-7 w-7" aria-hidden />,
                  title: "Caminos premium",
                  text: "Acceso a niveles y rutas avanzadas cuando estén marcadas como Premium.",
                },
                {
                  icon: <Sparkles className="h-7 w-7" aria-hidden />,
                  title: "Más práctica",
                  text: "Contenido adicional para familias que quieren avanzar con más profundidad.",
                },
                {
                  icon: <Crown className="h-7 w-7" aria-hidden />,
                  title: "Activación simple",
                  text: "El equipo puede activar o cambiar tu plan desde administración.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)]"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff] text-[#4867f5]">
                    {feature.icon}
                  </div>
                  <h2 className="mt-4 font-fredoka text-lg font-bold text-slate-950">
                    {feature.title}
                  </h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_2px_0_rgba(15,23,42,0.06)]">
            <div className="rounded-[1.5rem] bg-white p-5 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff3d3] text-[#b56a00]">
                <Crown className="h-9 w-9" aria-hidden />
              </div>
              <h2 className="mt-4 font-fredoka text-2xl font-bold text-slate-950">
                {isPremium
                  ? "Premium activo"
                  : status === "expired"
                    ? "Premium vencido"
                    : "Activar Premium"}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {isPremium
                  ? premiumUntilLabel
                    ? `Tu cuenta está en plan ${user?.plan} hasta ${premiumUntilLabel}.`
                    : `Tu cuenta está en plan ${user?.plan}.`
                  : status === "expired"
                    ? "Tu acceso venció. Un admin puede asignarte una nueva vigencia."
                  : "Solicitá la activación al equipo. Un admin actualizará tu cuenta cuando corresponda."}
              </p>

              <Link
                href={isPremium ? "/subjects" : "/settings"}
                className="btn-chunky mt-5 block rounded-2xl bg-[#4867f5] px-6 py-4 text-center text-sm font-black text-white shadow-[0_5px_0_#2445d8]"
              >
                {isPremium ? "Ver caminos" : "Ver mi cuenta"}
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
