import Link from "next/link";
import {
  CheckCircle2,
  Crown,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/server";
import {
  formatPremiumDate,
  hasPremiumAccess,
  premiumStatus,
} from "@/lib/premium";
import { TopNav } from "@/components/TopNav";
import { brand } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

export const dynamic = "force-dynamic";

function premiumWhatsappHref(email: string | null | undefined) {
  const accountEmail = email ?? "escribe aqui el correo con el que te registraste";
  const text = [
    "Hola, quiero activar Premium en Paskalito.",
    `Mi correo de cuenta es: ${accountEmail}`,
    "Me interesa: 1 dia de prueba / 1 mes / 3 meses / 6 meses / 12 meses.",
    "Por favor enviame la informacion para activar mi acceso.",
  ].join("\n");

  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export default async function PremiumPage() {
  const user = await getCurrentUser();
  const isPremium = user ? hasPremiumAccess(user) : false;
  const status = user ? premiumStatus(user) : "free";
  const premiumUntilLabel = formatPremiumDate(user?.premiumUntil);
  const whatsappHref = premiumWhatsappHref(user?.email);

  const ctaText = isPremium
    ? "Ver mis cursos"
    : status === "expired"
      ? "Renovar por WhatsApp"
      : "Activar por WhatsApp";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <TopNav />

      <main className="flex-1">
        <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 md:grid-cols-[1fr_380px] md:px-8 md:py-14">
          <section>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3d3] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#b56a00]">
              <Crown className="h-4 w-4" aria-hidden />
              Premium
            </div>

            <h1 className="mt-5 font-fredoka text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Más práctica guiada para que tu peque avance con confianza.
            </h1>

            <p className="mt-5 max-w-2xl text-base font-semibold leading-7 text-slate-500">
              Premium está pensado para familias que quieren más rutas,
              refuerzo y continuidad. Por ahora lo activamos manualmente:
              nos escribes por WhatsApp con el correo de tu cuenta y el equipo
              habilita tu acceso.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {isPremium ? (
                <Link
                  href="/subjects"
                  className="btn-chunky rounded-2xl bg-[#4867f5] px-6 py-4 text-center text-sm font-black text-white shadow-[0_5px_0_#2445d8]"
                >
                  {ctaText}
                </Link>
              ) : (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-chunky inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-6 py-4 text-center text-sm font-black text-white shadow-[0_5px_0_#128c3e]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {ctaText}
                </a>
              )}
              <Link
                href="/subjects"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-center text-sm font-black text-[#4867f5] shadow-[0_3px_0_rgba(15,23,42,0.08)]"
              >
                Ver cursos
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <LockKeyhole className="h-7 w-7" aria-hidden />,
                  title: "Cursos premium",
                  text: "Acceso a rutas marcadas como Premium cuando estén disponibles para tu cuenta.",
                },
                {
                  icon: <Sparkles className="h-7 w-7" aria-hidden />,
                  title: "Más práctica",
                  text: "Más oportunidades para repasar, avanzar y reforzar lo aprendido sin perder el ritmo.",
                },
                {
                  icon: <ShieldCheck className="h-7 w-7" aria-hidden />,
                  title: "Activación humana",
                  text: "Confirmamos tu correo por WhatsApp y activamos la vigencia desde el panel admin.",
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
                    ? "Tu Premium venció"
                    : "Activa Premium"}
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {isPremium
                  ? premiumUntilLabel
                    ? `Tu cuenta está en plan ${user?.plan} hasta ${premiumUntilLabel}.`
                    : `Tu cuenta está en plan ${user?.plan}.`
                  : status === "expired"
                    ? "Escríbenos por WhatsApp con tu correo para renovar tu acceso."
                    : "Escríbenos por WhatsApp con el correo que usaste al registrarte. Luego activamos tu plan manualmente."}
              </p>

              {!isPremium && (
                <div className="mt-5 space-y-3 rounded-2xl bg-[#f7f9ff] p-4 text-left">
                  {[
                    "Abre WhatsApp con el mensaje listo.",
                    "Envía el correo de tu cuenta.",
                    "Activamos tu acceso por el tiempo elegido.",
                  ].map((step) => (
                    <div
                      key={step}
                      className="flex items-start gap-2 text-sm font-bold leading-6 text-slate-700"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-[#34c759]"
                        aria-hidden
                      />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {isPremium ? (
                <Link
                  href="/subjects"
                  className="btn-chunky mt-5 block rounded-2xl bg-[#4867f5] px-6 py-4 text-center text-sm font-black text-white shadow-[0_5px_0_#2445d8]"
                >
                  Ver mis cursos
                </Link>
              ) : (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-chunky mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-6 py-4 text-center text-sm font-black text-white shadow-[0_5px_0_#128c3e]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Escribir por WhatsApp
                </a>
              )}
            </div>

            <p className="mt-4 text-center text-xs font-semibold leading-5 text-slate-400">
              No hay checkout dentro de la app todavía. La activación se hace de
              forma manual y segura desde administración.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
