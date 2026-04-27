"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/home", label: "Inicio", icon: "🏠" },
  { href: "/units", label: "Unidades", icon: "📚" },
  { href: "/league", label: "Liga", icon: "🏅" },
  { href: "/shop", label: "Tienda", icon: "🛍️" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

export function TopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 min-w-0 flex items-center gap-0.5 md:gap-1 overflow-x-auto no-scrollbar">
      {items.map((item) => {
        const active = pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-1.5 px-2.5 md:px-3.5 h-10 md:h-11 rounded-xl whitespace-nowrap transition-colors ${
              active
                ? "text-ink"
                : "text-ink-soft hover:text-ink hover:bg-cream/70"
            }`}
          >
            <span className="text-lg md:text-base leading-none" aria-hidden>
              {item.icon}
            </span>
            <span className="hidden sm:inline text-sm font-bold">{item.label}</span>
            {active && (
              <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-ink rounded-full"/>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
