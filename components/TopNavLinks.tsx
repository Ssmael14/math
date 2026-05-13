"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, Trophy, ShoppingBag, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Item = { href: string; label: string; Icon: LucideIcon; mobile: boolean };

const items: Item[] = [
  { href: "/home", label: "Inicio", Icon: Home, mobile: true },
  { href: "/subjects", label: "Materias", Icon: GraduationCap, mobile: true },
  { href: "/league", label: "Liga", Icon: Trophy, mobile: false },
  { href: "/shop", label: "Tienda", Icon: ShoppingBag, mobile: false },
  { href: "/profile", label: "Perfil", Icon: User, mobile: true },
];

export function TopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 min-w-0 flex items-center gap-1 md:gap-2">
      {items.map(({ href, label, Icon, mobile }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-2 px-2 md:px-3 h-12 md:h-14 transition-colors ${
              !mobile ? "hidden md:flex" : ""
            } ${active ? "text-ink" : "text-ink-mute hover:text-ink"}`}
          >
            <Icon
              className="w-6 h-6 md:w-[22px] md:h-[22px] shrink-0"
              strokeWidth={active ? 2.4 : 2}
              fill={active ? "currentColor" : "none"}
              fillOpacity={active ? 0.08 : 0}
            />
            <span className="hidden md:inline text-[15px] font-bold">
              {label}
            </span>
            {active && (
              <span className="absolute left-1 right-1 -bottom-px h-[3px] bg-ink rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
