import Link from "next/link";

const featuredRoutes = [
  {
    title: "Entrar",
    description: "Acceso al flujo de login y signup.",
    href: "/auth/login",
  },
  {
    title: "Lección",
    description: "El core del MVP en una sola ruta.",
    href: "/lesson",
  },
  {
    title: "Home",
    description: "Mapa principal para avanzar por unidades.",
    href: "/home",
  },
  {
    title: "Padres",
    description: "Panel y ajustes para acompañamiento.",
    href: "/parental",
  },
  {
    title: "Tienda",
    description: "Monedas, premios y equipamiento.",
    href: "/shop",
  },
];

const quickStats = [
  { value: "25", label: "pantallas (MVP)" },
  { value: "4–6", label: "años objetivo" },
  { value: "1", label: "flujo funcional" },
];

const categories = [
  "Matemáticas",
  "Ciencias de la Computación",
  "Programación e IA",
  "Análisis de Datos",
  "Ciencia e Ingeniería",
];

export default function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92),_rgba(255,249,240,1)_42%,_rgba(245,238,255,0.6)_100%)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#dff3ff]/70 blur-3xl" />
        <div className="absolute right-[-7rem] top-36 h-80 w-80 rounded-full bg-[#ffe6cf]/80 blur-3xl" />
        <div className="absolute bottom-[-6rem] left-1/3 h-96 w-96 rounded-full bg-[#e4dbff]/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-10 pt-5 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-black text-ink shadow-[0_12px_30px_rgba(61,46,79,0.08)]">
              L
            </span>
            <span className="text-xl font-semibold tracking-tight text-black sm:text-2xl">
              LearnMath
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(61,46,79,0.06)] transition-transform hover:-translate-y-0.5"
          >
            Iniciar sesión
          </Link>
        </header>

        <section className="grid flex-1 place-items-center py-10 lg:py-14">
          <div className="w-full max-w-6xl text-center">
            <div className="mx-auto mb-7 flex max-w-4xl items-end justify-center gap-3 sm:gap-6">
              <div className="hidden items-end gap-1 sm:flex">
                <span className="h-10 w-3 rounded-t-md bg-[#d8c7ff]" />
                <span className="h-14 w-3 rounded-t-md bg-[#cab1ff]" />
                <span className="h-18 w-3 rounded-t-md bg-[#b595ff]" />
                <span className="h-22 w-3 rounded-t-md bg-[#a07dff]" />
                <span className="h-26 w-3 rounded-t-md bg-[#ece7f7]" />
              </div>

              <div className="relative">
                <div className="absolute -left-10 top-2 hidden h-px w-32 border-t border-dashed border-black/20 sm:block" />
                <div className="absolute -left-8 top-0 hidden rounded-full bg-[#b595ff] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm sm:block">
                  31%
                </div>
                <h1 className="font-fraunces max-w-5xl text-balance text-[clamp(3.4rem,11vw,8.8rem)] leading-[0.88] tracking-[-0.06em] text-black">
                  Learn
                  <br />
                  by doing
                </h1>
              </div>

              <div className="relative hidden items-end sm:flex">
                <div className="absolute -right-8 top-3 hidden h-px w-36 border-t border-dashed border-black/20 lg:block" />
                <div className="absolute right-0 top-0 hidden rounded-full bg-[#7fb2ff] px-2 py-0.5 text-[11px] font-bold text-white shadow-sm lg:block">
                  Ready
                </div>
                <div className="grid grid-cols-4 gap-2 opacity-90">
                  {Array.from({ length: 14 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-2 w-2 rounded-full bg-[#ff9b6a]"
                      style={{
                        opacity: 0.28 + index * 0.05,
                        transform: `translateY(${index % 2 === 0 ? index * -2 : index * -1}px)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-2xl">
              <p className="text-pretty text-base leading-7 text-ink-soft sm:text-lg">
                Resolución interactiva de problemas: simple, visual y gratificante.
                Matemáticas, lógica y hábitos de estudio en un MVP listo para usar.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/auth/signup"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-full bg-[#28c85d] px-7 py-4 text-base font-bold text-white shadow-[0_6px_0_#169342,0_18px_40px_rgba(40,200,93,0.22)] transition-transform hover:-translate-y-0.5"
                >
                  Soy aprendiz
                </Link>
                <Link
                  href="/parental"
                  className="inline-flex min-w-[240px] items-center justify-center rounded-full border border-black/12 bg-white px-7 py-4 text-base font-bold text-black shadow-[0_8px_0_rgba(61,46,79,0.08)] transition-transform hover:-translate-y-0.5"
                >
                  Soy padre/madre o docente
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {quickStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-black/8 bg-white/80 px-4 py-4 text-left shadow-[0_12px_30px_rgba(61,46,79,0.06)] backdrop-blur"
                  >
                    <div className="text-2xl font-black tracking-tight text-black">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink-soft">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 rounded-[2rem] border border-black/8 bg-white/75 px-5 py-6 shadow-[0_18px_60px_rgba(61,46,79,0.08)] backdrop-blur sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/6 pb-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-mute">
                    Acceso MVP
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-black">
                    Ir directamente al producto
                  </h2>
                </div>
                <Link
                  href="/home"
                  className="text-sm font-semibold text-ink-soft underline underline-offset-4"
                >
                  Ver el mapa completo
                </Link>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {featuredRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="group rounded-3xl border border-black/8 bg-white px-5 py-5 text-left transition-transform hover:-translate-y-1 hover:border-black/15"
                    style={{ boxShadow: "var(--shadow-chunky)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-bold text-black">
                          {route.title}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-ink-soft">
                          {route.description}
                        </p>
                      </div>
                      <span className="mt-1 rounded-full bg-[#fff0e4] px-2.5 py-1 text-xs font-bold text-[#c96a33] transition-colors group-hover:bg-[#ffe3c9]">
                        Abrir
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <footer className="mt-10 flex flex-col items-center gap-4 border-t border-black/6 pt-6 text-sm text-ink-soft lg:flex-row lg:justify-between">
              <p>
                Construido como un MVP funcional con rutas reales, flujo parental y
                sesiones de aprendizaje.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-black/8 bg-white px-4 py-2 font-medium text-ink-soft shadow-[0_8px_20px_rgba(61,46,79,0.05)]"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
