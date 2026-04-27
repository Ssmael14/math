"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Inicio", icon: "🏠", key: "home" },
  { href: "/units", label: "Unidades", icon: "📚", key: "units" },
  { href: "/league", label: "Liga", icon: "🏅", key: "league" },
  { href: "/shop", label: "Tienda", icon: "🛍️", key: "shop" },
  { href: "/profile", label: "Perfil", icon: "👤", key: "profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-cream flex items-end justify-around pt-2"
      style={{
        // En mobile real respeta el home indicator; en desktop mockup cae en 0
        paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)",
        minHeight: 72,
      }}
    >
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            className="flex flex-col items-center gap-0.5"
          >
            <span
              className={`text-2xl transition-transform ${active ? "scale-110" : "opacity-50"}`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-extrabold ${active ? "text-ink" : "text-ink-mute"}`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
