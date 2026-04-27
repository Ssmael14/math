import Link from "next/link";

const screens = [
  { group: "🔐 Acceso", items: [
    { num: "00a", label: "Login", href: "/auth/login" },
    { num: "00b", label: "Crear cuenta", href: "/auth/signup" },
    { num: "00c", label: "Olvidé contraseña", href: "/auth/forgot" },
    { num: "00d", label: "Crear perfil niño", href: "/profile/create" },
  ]},
  { group: "👋 Onboarding", items: [
    { num: "01", label: "Bienvenida", href: "/onboarding/1" },
    { num: "02", label: "Aprender jugando", href: "/onboarding/2" },
    { num: "03", label: "Recompensas", href: "/onboarding/3" },
  ]},
  { group: "🗺️ Flujo principal", items: [
    { num: "04", label: "Unidades", href: "/units" },
    { num: "05", label: "Home · Mapa", href: "/home" },
    { num: "06", label: "Lección · Suma", href: "/lesson" },
    { num: "07", label: "Victoria 🎉", href: "/victory" },
    { num: "08", label: "¡Subiste de nivel! ⬆️", href: "/level-up" },
    { num: "09", label: "Sin corazones 💔", href: "/game-over" },
  ]},
  { group: "🎮 Ejercicios", items: [
    { num: "10", label: "Arrastrar peces 🐟", href: "/exercise/drag" },
    { num: "11", label: "Resta visual 🧁", href: "/exercise/subtract" },
    { num: "12", label: "Contar ⭐", href: "/exercise/count" },
    { num: "12a", label: "Unir con líneas 🔗", href: "/exercise/match" },
    { num: "12b", label: "Llenar hueco 🧩", href: "/exercise/fill" },
    { num: "12c", label: "Trazar número ✍️", href: "/exercise/trace" },
  ]},
  { group: "👤 Social, perfil y logros", items: [
    { num: "13", label: "Liga · Ranking 🏅", href: "/league" },
    { num: "14", label: "Perfil de Sofía", href: "/profile" },
    { num: "15", label: "Tienda de Lumi 🛍️", href: "/shop" },
    { num: "16", label: "Medallas 🏆", href: "/achievements" },
  ]},
  { group: "👨‍👩‍👧 Padres y ajustes", items: [
    { num: "17", label: "Panel padres 📊", href: "/parental" },
    { num: "18", label: "Ajustes ⚙️", href: "/settings" },
  ]},
];

export default function Index() {
  return (
    <main className="max-w-5xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="font-fredoka text-5xl font-bold text-ink">
          LearnMath <span className="text-pink">·</span> Aventura con Lumi
        </h1>
        <p className="mt-3 text-ink-soft max-w-2xl leading-relaxed">
          MVP en Next.js 15 + Tailwind v4. 25 pantallas — flujo completo listo para beta.
          Cada pantalla es una ruta real, pensada para móvil (375×812).
          Abrí cualquier link y usá las flechas para navegar.
        </p>
      </header>

      {screens.map((section) => (
        <section key={section.group} className="mb-10">
          <h2 className="font-fredoka text-2xl font-semibold text-ink-soft mb-4">
            {section.group}
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {section.items.map((s) => (
              <li key={s.num}>
                <Link
                  href={s.href}
                  className="btn-chunky block bg-white rounded-2xl p-4 border-2 border-white hover:border-pink transition-colors"
                  style={{ boxShadow: "var(--shadow-chunky)" }}
                >
                  <div className="text-xs font-extrabold text-ink-mute tracking-wide">
                    {s.num}
                  </div>
                  <div className="font-fredoka font-semibold text-ink mt-1">
                    {s.label}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
