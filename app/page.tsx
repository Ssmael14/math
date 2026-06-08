import Link from "next/link";
import { brand } from "@/lib/brand";

const featuredRoutes = [
  {
    title: "Empezar",
    description: "Crear una cuenta y preparar el primer perfil.",
    href: "/auth/signup",
  },
  {
    title: "Entrar",
    description: "Continuar una aventura ya iniciada.",
    href: "/auth/login",
  },
  {
    title: "Mapa",
    description: "Ver caminos, unidades y lecciones activas.",
    href: "/home",
  },
  {
    title: "Padres",
    description: "Acompañamiento, progreso y seguridad.",
    href: "/parental",
  },
  {
    title: "Tienda",
    description: "Premios, gemas y objetos desbloqueables.",
    href: "/shop",
  },
  {
    title: "Premium",
    description: "Acceso ampliado cuando esté activado.",
    href: "/premium",
  },
];

const quickStats = [
  { value: "4-6", label: "años iniciales" },
  { value: "27", label: "lecciones base" },
  { value: "6", label: "unidades NEL" },
];

const pillars = [
  "Clasificar",
  "Patrones",
  "Contar",
  "Comparar",
  "Juntar",
  "Sacar",
];

export default function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream text-ink">
      <div className="absolute inset-x-0 top-0 h-72 bg-linear-to-b from-sky-soft via-white to-transparent" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-5 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src={brand.assets.mark}
              alt=""
              className="h-11 w-11 rounded-2xl shadow-[0_12px_30px_rgba(72,103,245,0.12)]"
            />
            <span className="text-xl font-black tracking-tight text-ink sm:text-2xl">
              {brand.appName}
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="rounded-full border border-sky-soft bg-white px-5 py-2.5 text-sm font-black text-sky shadow-[0_10px_30px_rgba(72,103,245,0.08)] transition-transform hover:-translate-y-0.5"
          >
            Iniciar sesión
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex rounded-full border border-sky-soft bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky shadow-[0_8px_24px_rgba(72,103,245,0.08)]">
              Educación inicial con juegos visuales
            </div>
            <h1 className="font-fredoka text-[clamp(4rem,12vw,8.5rem)] font-bold leading-[0.82] tracking-tight text-ink">
              {brand.appName}
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-lg font-bold leading-8 text-ink-soft sm:text-xl">
              Matemáticas para niños de 4 a 6 años: tocar, ordenar, comparar y
              descubrir cantidades con una progresión inspirada en Singapore
              NEL.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/signup"
                className="btn-chunky inline-flex min-w-[220px] items-center justify-center rounded-2xl bg-sky px-7 py-4 text-base font-black text-white shadow-[0_5px_0_#2445d8] transition-transform hover:-translate-y-0.5"
              >
                Crear cuenta
              </Link>
              <Link
                href="/home"
                className="btn-chunky inline-flex min-w-[220px] items-center justify-center rounded-2xl border-2 border-sky-soft bg-white px-7 py-4 text-base font-black text-ink shadow-[0_5px_0_rgba(72,103,245,0.12)] transition-transform hover:-translate-y-0.5"
              >
                Ver el mapa
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-sky-soft bg-white px-4 py-4 shadow-[0_10px_26px_rgba(72,103,245,0.07)]"
                >
                  <div className="text-2xl font-black tracking-tight text-sky">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm font-bold text-ink-soft">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[520px]">
            <div className="relative rounded-[2rem] border border-sky-soft bg-white p-6 shadow-[0_24px_80px_rgba(72,103,245,0.14)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-sky">
                    Aventura inicial
                  </div>
                  <h2 className="mt-1 font-fredoka text-3xl font-bold text-ink">
                    Aprendé haciendo
                  </h2>
                </div>
                <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-black text-mint">
                  Activo
                </span>
              </div>

              <img
                src={brand.assets.mascotHappy}
                alt={brand.mascotName}
                className="mx-auto mt-2 h-64 w-64 object-contain drop-shadow-[0_16px_26px_rgba(72,103,245,0.16)]"
              />

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {pillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="rounded-2xl bg-sky-soft px-3 py-2 text-center text-sm font-black text-sky"
                  >
                    {pillar}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-sky-soft bg-white/85 px-5 py-6 shadow-[0_18px_60px_rgba(72,103,245,0.08)] backdrop-blur sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-soft pb-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-sky">
                Acceso rápido
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-ink">
                Rutas principales
              </h2>
            </div>
            <Link
              href="/home"
              className="text-sm font-black text-sky underline underline-offset-4"
            >
              Ir al producto
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featuredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-2xl border border-sky-soft bg-white px-5 py-5 text-left transition-transform hover:-translate-y-1 hover:border-sky"
                style={{ boxShadow: "var(--shadow-chunky)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-black text-ink">
                      {route.title}
                    </div>
                    <p className="mt-2 text-sm font-bold leading-6 text-ink-soft">
                      {route.description}
                    </p>
                  </div>
                  <span className="mt-1 rounded-full bg-sky-soft px-2.5 py-1 text-xs font-black text-sky transition-colors group-hover:bg-sky group-hover:text-white">
                    Abrir
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
