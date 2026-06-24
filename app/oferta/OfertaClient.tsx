"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  Gift,
  Percent,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

type Plan = {
  id: "month" | "launch" | "year";
  label: string;
  badge?: string;
  regular: number;
  price: number;
  helper: string;
  days: number;
};

const plans: Plan[] = [
  {
    id: "month",
    label: "1 mes",
    regular: 54,
    price: 30,
    helper: "Acceso mensual",
    days: 30,
  },
  {
    id: "launch",
    label: "2 meses",
    badge: "Más popular",
    regular: 108,
    price: 34,
    helper: "Paga 1 mes y recibe 1 mes extra",
    days: 60,
  },
  {
    id: "year",
    label: "12 meses",
    badge: "Mayor ahorro",
    regular: 648,
    price: 199,
    helper: "Todo el año escolar",
    days: 365,
  },
];

const trialPlan = {
  label: "1 día",
  price: 1,
  helper: "Prueba rápida por 1 día",
};

function formatSoles(value: number) {
  return `S/${value.toFixed(0)}`;
}

function formatSolesDecimal(value: number) {
  return `S/${value.toFixed(2)}`;
}

function discountFor(plan: Plan) {
  if (plan.regular <= plan.price) return 0;
  return Math.round(((plan.regular - plan.price) / plan.regular) * 100);
}

function dailyPriceParts(price: number, days: number) {
  const dailyPrice = price / days;
  const soles = Math.floor(dailyPrice);
  const cents = Math.round((dailyPrice - soles) * 100)
    .toString()
    .padStart(2, "0");

  return { soles, cents };
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function whatsappHref(
  plan: Pick<Plan, "label" | "price" | "helper">,
  source: "plan" | "trial-rescue",
) {
  const text =
    source === "trial-rescue"
      ? [
          "Hola, quiero probar Paskalito Premium por 1 día por S/1.",
          "Pagaré por Yape si me confirmas los datos.",
          "Mi correo de cuenta es:",
        ]
      : [
          "Hola, quiero activar Paskalito Premium.",
          `Plan elegido: ${plan.label}`,
          `Detalle: ${plan.helper}`,
          `Precio: ${formatSoles(plan.price)}`,
          "Método de pago: Yape",
          "Mi correo de cuenta es:",
        ];

  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(
    text.join("\n"),
  )}`;
}

export function OfertaClient() {
  const [step, setStep] = useState<"intro" | "plans">("intro");
  const [selectedPlanId, setSelectedPlanId] = useState<Plan["id"]>("launch");
  const [discountUnlocked, setDiscountUnlocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);
  const [rescueOpen, setRescueOpen] = useState(false);
  const selectedPlan =
    plans.find((plan) => plan.id === selectedPlanId) ?? plans[2];

  useEffect(() => {
    if (step !== "plans") return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== "plans") return;

    let shown = false;
    const onMouseLeave = (event: MouseEvent) => {
      if (shown || event.clientY > 12) return;
      shown = true;
      setRescueOpen(true);
    };
    const onScroll = () => {
      if (shown) return;
      const progress =
        window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (progress > 0.65) {
        shown = true;
        window.setTimeout(() => setRescueOpen(true), 1200);
      }
    };

    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [step]);

  const openWhatsAppForPlan = (plan: Plan) => {
    window.open(whatsappHref(plan, "plan"), "_blank", "noopener,noreferrer");
  };

  const handleDiscountClick = () => {
    if (!discountUnlocked) {
      setDiscountUnlocked(true);
      return;
    }

    openWhatsAppForPlan(selectedPlan);
  };

  const handlePlanClick = (plan: Plan) => {
    setSelectedPlanId(plan.id);
  };

  const continueToPlans = () => {
    setStep("plans");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (step === "intro") {
    return (
      <main className="min-h-[100dvh] bg-[#fffaf4] px-4 pb-24 pt-5 text-slate-950 md:px-5 md:pb-28 md:pt-10">
        <section className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl flex-col justify-center">
          <div className="text-center">
            <h1 className="font-fredoka text-4xl font-bold leading-[0.96] tracking-tight md:text-6xl">
              Aprende matemática y lectura jugando
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-slate-600 md:mt-5 md:text-lg md:leading-8">
              Para inicial y primeros grados, con actividades cortas de tocar,
              arrastrar y trazar.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#e7d9ca] bg-white shadow-[0_8px_0_rgba(15,23,42,0.08)] md:mt-10 md:rounded-[2rem]">
            <div className="grid grid-cols-2">
              <div className="relative flex min-h-[210px] flex-col justify-end overflow-hidden bg-slate-950 p-3 text-white md:min-h-64 md:p-5">
                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-950 to-slate-800" />
                <div className="absolute right-3 top-4 opacity-20 md:right-4 md:top-5">
                  <Smartphone className="h-16 w-16 md:h-24 md:w-24" aria-hidden />
                </div>
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white md:h-14 md:w-14">
                    <Smartphone className="h-6 w-6 md:h-8 md:w-8" aria-hidden />
                  </div>
                  <div className="mt-4 font-fredoka text-2xl font-bold leading-tight md:mt-5 md:text-3xl">
                    Pantalla sin rumbo
                  </div>
                  <div className="mt-1 text-sm font-bold text-white/65 md:mt-2 md:text-lg">
                    Tiempo perdido
                  </div>
                </div>
              </div>

              <div className="relative flex min-h-[210px] flex-col justify-end overflow-hidden bg-[#eef3ff] p-3 text-slate-950 md:min-h-64 md:p-5">
                <div className="absolute inset-0 bg-linear-to-br from-white via-[#eef3ff] to-[#dfe7ff]" />
                <div className="absolute left-1/2 top-5 h-20 w-20 -translate-x-1/2 rounded-full bg-white/70 blur-xl md:top-6 md:h-28 md:w-28" />
                <img
                  src={brand.assets.mascotHappy}
                  alt=""
                  className="absolute left-1/2 top-4 h-24 w-24 -translate-x-1/2 object-contain md:top-6 md:h-32 md:w-32"
                />
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#4867f5] text-white md:h-14 md:w-14">
                    <Sparkles className="h-6 w-6 md:h-8 md:w-8" aria-hidden />
                  </div>
                  <div className="mt-4 font-fredoka text-2xl font-bold leading-tight md:mt-5 md:text-3xl">
                    Juegos con Paskalito
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-500 md:mt-2 md:text-lg">
                    Hábito ganado
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-5 max-w-sm text-center text-xs font-black uppercase tracking-wide text-[#4867f5] md:mt-8 md:text-sm">
            Practica pocos minutos al día
          </p>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7d9ca] bg-white/95 px-4 py-2.5 backdrop-blur md:py-3">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={continueToPlans}
              className="btn-chunky block w-full rounded-2xl bg-[#4867f5] px-6 py-3.5 text-center text-base font-black text-white shadow-[0_5px_0_#2445d8] md:py-4"
            >
              Continuar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[#fffaf4] text-slate-950">
      <div className="sticky top-0 z-30 border-b border-[#eee2d5] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-bold leading-tight text-slate-700">
              Tu -{discountFor(plans[1])}% de descuento expira en:
            </div>
            <div className="flex items-center gap-2 font-fredoka text-2xl font-bold leading-none">
              <Clock3 className="h-5 w-5 text-[#ff5a78]" aria-hidden />
              {formatTime(secondsLeft)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDiscountClick}
            className={`btn-chunky rounded-2xl bg-[#4867f5] px-4 py-3 text-sm font-black text-white shadow-[0_5px_0_#2445d8] ${
              discountUnlocked ? "" : "offer-wave-button"
            }`}
          >
            {discountUnlocked ? "Enviar por WhatsApp" : "Aplicar descuento"}
          </button>
        </div>
      </div>

      <section className="mx-auto max-w-2xl px-4 pb-28 pt-6 md:px-8 md:pt-12">
        <div className="text-center">
          <h1 className="font-fredoka text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            Consigue tu plan con más descuento
          </h1>
        </div>

        <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#bfe8c7] bg-[#ecfff2] md:mt-8">
          <div className="p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#22c55e] text-white md:h-12 md:w-12">
                <Percent className="h-6 w-6 md:h-7 md:w-7" aria-hidden />
              </div>
              <div className="font-fredoka text-2xl font-bold md:text-3xl">
                {discountUnlocked
                  ? "¡Promo aplicada!"
                  : "Descuento disponible"}
              </div>
            </div>

            <div className="mt-4 border-t-2 border-dashed border-[#b8e5c3] pt-4 md:mt-5 md:pt-5">
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 md:py-4 md:text-lg">
                  <Check className="h-5 w-5 shrink-0 text-[#22c55e] md:h-6 md:w-6" aria-hidden />
                  <span className="truncate">
                    {discountUnlocked
                      ? "PASKALITO_DESCUENTO"
                      : "Toca el botón morado"}
                  </span>
                </div>
                <div className="rounded-2xl bg-[#bff0cc] px-4 py-3 text-center font-fredoka text-xl font-bold text-[#14532d] md:px-5 md:py-4 md:text-2xl">
                  {formatTime(secondsLeft)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 md:mt-8">
          <div className="space-y-3 md:mt-6 md:space-y-4">
            {plans.map((plan) => {
              const selected = selectedPlan.id === plan.id;
              const displayPrice = discountUnlocked ? plan.price : plan.regular;
              const daily = dailyPriceParts(displayPrice, plan.days);
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  className={`relative w-full rounded-[1.5rem] border-2 bg-white p-4 text-left transition md:p-5 ${
                    selected
                      ? "border-[#4867f5] bg-[#eef3ff] shadow-[0_6px_0_#2445d8]"
                      : "border-[#e7d9ca] shadow-[0_4px_0_rgba(15,23,42,0.08)]"
                  }`}
                >
                  {plan.badge && (
                    <div
                      className={`absolute inset-x-0 -top-px rounded-t-[1.35rem] px-4 py-2 text-center text-xs font-black uppercase tracking-widest text-white ${
                        selected ? "bg-[#4867f5]" : "bg-slate-800"
                      }`}
                    >
                      {plan.badge}
                    </div>
                  )}
                  <div className={plan.badge ? "pt-7" : ""}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-3 ${
                            selected
                              ? "border-[#4867f5] bg-white text-[#4867f5]"
                              : "border-slate-300 bg-white text-transparent"
                          }`}
                        >
                          ●
                        </span>
                        <div>
                          <div className="font-fredoka text-xl font-bold md:text-2xl">
                            {plan.label}
                          </div>
                          {discountUnlocked && discountFor(plan) > 0 && (
                            <div className="mt-1.5 inline-flex rounded-full bg-[#f2e7ff] px-3 py-1 text-xs font-black uppercase text-[#8b00d8] md:mt-2">
                              Ahorra {discountFor(plan)}%
                            </div>
                          )}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-400 md:mt-2">
                            {discountUnlocked && (
                              <span className="line-through">
                                {formatSoles(plan.regular)}
                              </span>
                            )}
                            <span
                              className={
                                discountUnlocked
                                  ? "text-slate-400"
                                  : "text-slate-700"
                              }
                            >
                              {formatSoles(displayPrice)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-[96px] text-right md:min-w-[112px]">
                        {discountUnlocked && (
                          <div className="text-sm font-bold text-slate-400 line-through">
                            {formatSolesDecimal(plan.regular / plan.days)}
                          </div>
                        )}
                        <div className="flex justify-end gap-1 font-fredoka font-bold leading-none">
                          <span className="text-xl text-slate-400">S/</span>
                          <span
                            className={
                              selected
                                ? "text-6xl text-slate-950 md:text-7xl"
                                : "text-6xl text-slate-400 md:text-7xl"
                            }
                          >
                            {daily.soles}
                          </span>
                          <span
                            className={
                              selected
                                ? "mt-3 text-2xl text-slate-950"
                                : "mt-3 text-2xl text-slate-400"
                            }
                          >
                            {daily.cents}
                          </span>
                        </div>
                        <div className="text-xs font-black uppercase text-slate-500">
                          /día
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <p className="mx-auto mt-7 max-w-md text-center text-xs font-bold leading-5 text-slate-400">
          {discountUnlocked
            ? "Toca un plan para pedir la activación por WhatsApp y pagar por Yape."
            : "Toca “Aplicar descuento” para activar la promo antes de elegir."}
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e7d9ca] bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black uppercase text-slate-400">
              {discountUnlocked ? "Plan con descuento" : "Precio normal"}
            </div>
            <div className="truncate font-fredoka text-xl font-bold">
              {selectedPlan.label} ·{" "}
              {formatSoles(discountUnlocked ? selectedPlan.price : selectedPlan.regular)}
            </div>
            <div className="text-xs font-black uppercase text-[#4867f5]">
              {discountUnlocked ? selectedPlan.helper : "Descuento todavía no aplicado"}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDiscountClick}
            className={`btn-chunky inline-flex items-center gap-2 rounded-2xl bg-[#4867f5] px-5 py-4 text-sm font-black text-white shadow-[0_5px_0_#2445d8] ${
              discountUnlocked ? "" : "offer-wave-button"
            }`}
          >
            {discountUnlocked ? "Enviar por WhatsApp" : "Aplicar descuento"}
          </button>
        </div>
      </div>

      {rescueOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-20 max-w-md rounded-[2rem] bg-white p-5 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setRescueOpen(false)}
              className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-[2rem] bg-[#ecfff2] text-[#22c55e] shadow-[0_5px_0_#b8e5c3]">
              <Gift className="h-14 w-14" aria-hidden />
            </div>
            <h2 className="mt-4 font-fredoka text-3xl font-bold">
              ¿Quieres probar antes?
            </h2>
            <p className="mt-3 text-sm font-bold leading-6 text-slate-500">
              Pide una prueba de 1 día por S/1 y revisa si Paskalito encaja con
              tu peque antes de elegir un plan largo.
            </p>
            <a
              href={whatsappHref(trialPlan, "trial-rescue")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-chunky mt-5 flex items-center justify-center gap-2 rounded-2xl bg-[#25d366] px-5 py-4 text-sm font-black text-white shadow-[0_5px_0_#128c3e]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Pedir prueba por WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
