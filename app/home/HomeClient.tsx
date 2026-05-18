"use client";
import Link from "next/link";
import { Lumi } from "@/components/Lumi";
import { useLumiVariant } from "@/lib/use-lumi-variant";
import { TutorialOverlay } from "@/components/TutorialOverlay";

type Node = {
  id: string;
  label: string;
  status: "done" | "current" | "locked";
};

export function HomeClient({
  unit,
  nodes,
  reviewsDue,
  pathHref,
}: {
  unit: { title: string; order: number; progressPct: number };
  nodes: Node[];
  reviewsDue: number;
  pathHref: string;
}) {
  const [variant] = useLumiVariant();

  return (
    <main className="flex-1 w-full flex flex-col md:justify-center">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-16 md:grid md:grid-cols-[360px_1fr] md:gap-16">
        <aside>
          <div
            data-tour="unit-card"
            className="bg-white rounded-2xl p-4 md:p-6 border-2 border-white"
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-sun-soft flex items-center justify-center text-3xl flex-shrink-0">
                🧮
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
                  UNIDAD {unit.order}
                </div>
                <div className="font-fredoka font-bold text-lg md:text-xl text-ink leading-tight">
                  {unit.title}
                </div>
              </div>
            </div>
            <div className="mt-4 h-2 bg-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-mint rounded-full transition-all"
                style={{ width: `${unit.progressPct * 100}%` }}
              />
            </div>
            <div className="mt-2 text-xs font-bold text-ink-soft">
              {Math.round(unit.progressPct * 100)}% completo
            </div>
            <Link
              href={pathHref}
              className="mt-4 hidden md:block text-sm font-bold text-sky hover:text-ink"
            >
              Ver el camino completo →
            </Link>
          </div>

          {/* SRS · Repaso del día */}
          <Link
            data-tour="review-card"
            href="/review"
            className={`btn-chunky mt-4 block rounded-2xl p-4 border-2 ${
              reviewsDue > 0
                ? "bg-lilac-soft border-lilac"
                : "bg-white/60 border-white text-ink-soft"
            }`}
            style={{ boxShadow: "var(--shadow-chunky)" }}
            aria-label={
              reviewsDue > 0
                ? `Repasar ${reviewsDue} ejercicios`
                : "Repaso del día (sin pendientes)"
            }
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl flex-shrink-0">
                🔁
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-extrabold tracking-widest text-lilac">
                  REPASO DEL DÍA
                </div>
                <div className="font-fredoka font-bold text-base text-ink leading-tight">
                  {reviewsDue > 0
                    ? `${reviewsDue} ejercicio${reviewsDue === 1 ? "" : "s"} para repasar`
                    : "Sin pendientes — ¡al día!"}
                </div>
              </div>
              {reviewsDue > 0 && (
                <div
                  className="min-w-[28px] h-7 px-2 rounded-full bg-pink text-white text-xs font-black flex items-center justify-center"
                  aria-hidden
                >
                  {reviewsDue}
                </div>
              )}
            </div>
          </Link>
        </aside>

        <section className="mt-6 md:mt-0">
          <h1 className="hidden md:block font-fredoka text-3xl font-bold text-ink mb-8">
            Tu camino de hoy
          </h1>
          <div className="flex flex-col items-center md:items-start gap-4 md:gap-5">
            {nodes.map((n, i) => {
              const isCurrent = n.status === "current";
              const isOdd = i % 2 === 1;
              return (
                <div
                  key={n.id}
                  className={`flex items-center gap-4 w-full md:max-w-md ${isOdd ? "ml-16 md:ml-0" : ""}`}
                >
                  <Link
                    data-tour={isCurrent ? "current-lesson" : undefined}
                    href={isCurrent ? `/lesson/${n.id}` : "#"}
                    className={`btn-chunky relative w-20 h-20 rounded-full flex items-center justify-center border-4 border-white flex-shrink-0 ${isCurrent ? "animate-pulse-soft" : ""}`}
                    style={{
                      background:
                        n.status === "done"
                          ? "#68C886"
                          : n.status === "current"
                            ? "#FFC94A"
                            : "#E5DFED",
                      boxShadow: "0 5px 0 rgba(61,46,79,0.2)",
                      opacity: n.status === "locked" ? 0.7 : 1,
                    }}
                  >
                    {n.status === "done" && (
                      <span className="text-white text-3xl">✓</span>
                    )}
                    {n.status === "current" && (
                      <Lumi variant={variant} size={60} animate={false} />
                    )}
                    {n.status === "locked" && (
                      <span className="text-2xl">🔒</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="font-fredoka font-bold text-ink">
                      {n.label}
                    </div>
                    {isCurrent && (
                      <div className="text-xs font-bold text-sun-deep mt-0.5">
                        ¡Seguí acá! →
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <TutorialOverlay />
    </main>
  );
}
